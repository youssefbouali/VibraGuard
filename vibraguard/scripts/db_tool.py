"""VibraGuard Database Export/Import Tool

Export or import Oracle and MongoDB databases running in Kubernetes.
Requires kubectl installed and configured with cluster access.

Usage:
  python scripts/db_tool.py --export
  python scripts/db_tool.py --export --mongodb-only
  python scripts/db_tool.py --export --oracle-only --output-dir ./backup_20260619
  python scripts/db_tool.py --import --dump-dir ./backup_20260619
  python scripts/db_tool.py --import --mongodb-only --dump-dir ./backup_20260619
  python scripts/db_tool.py --import --oracle-only --dump-dir ./backup_20260619
"""

import argparse
import subprocess
import sys
import os
import io
import tarfile
import time
from pathlib import Path
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────
# Defaults (override via CLI args)
# ─────────────────────────────────────────────────────────────────────
NAMESPACE = "vibraguard"
ORACLE_LABEL = "app=oracle-db"
MONGODB_LABEL = "app=mongodb"
ORACLE_USER = "system"
ORACLE_PASSWORD = "password"
ORACLE_SID = "XE"
ORACLE_SCHEMAS = None  # None = full export (full=Y)
MONGODB_DB = "vibraguard"

# Common Oracle DATA_PUMP_DIR paths to probe inside the container
ORACLE_DUMP_CANDIDATES = [
    "/opt/oracle/admin/XE/dpdump/",
    "/u01/app/oracle/admin/XE/dpdump/",
    "/opt/oracle/dpdump/",
    "/u01/app/oracle/dpdump/",
    "/u01/app/oracle/oradata/dpdump/",
]

# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────
def fatal(msg):
    print(f"[ERROR] {msg}", file=sys.stderr)
    sys.exit(1)


def get_pod_env(pod, var, ns=None):
    """Read an environment variable from a pod."""
    ns = ns or NAMESPACE
    r = kubectl(["exec", "-n", ns, pod, "--", "sh", "-c", f"echo ${var}"], check=False)
    return r.stdout.strip() if r.returncode == 0 else None


def kubectl(args, check=True, capture=True):
    """Run a kubectl command and return the completed process."""
    cmd = ["kubectl"] + args
    kwargs = {}
    if capture:
        kwargs["capture_output"] = True
        kwargs["text"] = True
    try:
        return subprocess.run(cmd, check=check, **kwargs)
    except subprocess.CalledProcessError as e:
        detail = e.stderr.strip() if e.stderr else str(e)
        print(f"[ERROR] kubectl {' '.join(args[:4])}... failed: {detail}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        fatal("kubectl not found. Install it or add it to PATH.")


def get_pod(label, ns=None, name_prefix=None):
    """Return a running pod — first by label, then by name prefix fallback."""
    ns = ns or NAMESPACE

    # Attempt 1: label selector
    if label:
        r = kubectl([
            "get", "pods", "-n", ns, "-l", label,
            "--field-selector", "status.phase=Running",
            "-o", "jsonpath={.items[0].metadata.name}",
        ], check=False)
        pod = r.stdout.strip()
        if pod:
            return pod

    # Attempt 2: name prefix fallback (e.g. "oracle-db", "mongodb")
    if name_prefix:
        r = kubectl([
            "get", "pods", "-n", ns,
            "--field-selector", "status.phase=Running",
            "-o", "jsonpath={range .items[*]}{.metadata.name}{\"\\n\"}{end}",
        ])
        candidates = [p for p in r.stdout.strip().splitlines() if p.startswith(name_prefix)]
        if candidates:
            print(f"  [INFO] Found pod by name prefix '{name_prefix}': {candidates[0]}")
            return candidates[0]

    # Attempt 3: list all pods so user can inspect
    r = kubectl([
        "get", "pods", "-n", ns,
        "-o", "custom-columns=NAME:.metadata.name,STATUS:.status.phase,LABELS:.metadata.labels",
    ])
    print(f"  [INFO] Available pods in namespace '{ns}':\n{r.stdout}")
    fatal(
        f"No running pod found (label='{label}', name_prefix='{name_prefix}'). "
        f"Use --oracle-pod / --mongodb-pod to specify the pod name directly."
    )


def exec_pod(pod, cmd, ns=None, check=True):
    """Run *cmd* list inside *pod* and return CompletedProcess."""
    ns = ns or NAMESPACE
    full = ["exec", "-n", ns, pod, "--"] + cmd
    return kubectl(full, check=check)


def cp_from_pod(pod, src, dest):
    kubectl(["cp", f"{NAMESPACE}/{pod}:{src}", str(dest)])


def cp_to_pod(pod, src, dest):
    kubectl(["cp", str(src), f"{NAMESPACE}/{pod}:{dest}"])


def cp_dir_to_pod(pod, src_dir, dest_dir):
    """Copy a directory tree into a pod via tar pipe (handles dirs reliably)."""
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tar:
        tar.add(str(src_dir), arcname="")
    buf.seek(0)
    exec_pod(pod, ["mkdir", "-p", str(dest_dir)])
    cmd = ["kubectl", "exec", "-n", NAMESPACE, pod, "-i", "--",
           "tar", "xf", "-", "-C", str(dest_dir)]
    subprocess.run(cmd, input=buf.getvalue(), check=True)


def now_str():
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def run_prepod(pod, desc, cmd, ok_exit_codes=None):
    """Run a command inside *pod*, print description and output."""
    print(f"  [{desc}] ", end="", flush=True)
    r = exec_pod(pod, cmd, check=False)
    for line in r.stdout.strip().splitlines():
        print(f"    {line}")
    if r.stderr and r.stderr.strip():
        for line in r.stderr.strip().splitlines():
            print(f"    [STDERR] {line}", file=sys.stderr)
    if r.returncode != 0 and (not ok_exit_codes or r.returncode not in ok_exit_codes):
        print(f"  [ERROR] Command failed with exit code {r.returncode}", file=sys.stderr)
        sys.exit(1)
    return r


def check_pod_tool(pod, tool):
    """Return True if *tool* binary exists in *pod*."""
    r = exec_pod(pod, ["which", tool], check=False)
    return r.returncode == 0


def find_pod_tool(pod, tools):
    """Return the first tool from *tools* found in *pod*, or None."""
    for tool in tools:
        if check_pod_tool(pod, tool):
            return tool
    return None


# ─────────────────────────────────────────────────────────────────────
# Oracle helpers
# ─────────────────────────────────────────────────────────────────────
def detect_oracle_env(pod):
    """Auto-detect ORACLE_PASSWORD and ORACLE_SID from the pod's environment."""
    global ORACLE_PASSWORD, ORACLE_SID
    pw = get_pod_env(pod, "ORACLE_PASSWORD")
    if pw:
        old = ORACLE_PASSWORD
        ORACLE_PASSWORD = pw
        print(f"  [INFO] Detected ORACLE_PASSWORD from pod environment")
    sid = get_pod_env(pod, "ORACLE_SID")
    if sid:
        ORACLE_SID = sid
        print(f"  [INFO] Detected ORACLE_SID={sid} from pod environment")


def find_oracle_dump_dir(pod):
    """Probe common paths inside *pod* for a writable dpdump directory."""
    for candidate in ORACLE_DUMP_CANDIDATES:
        r = exec_pod(pod, ["sh", "-c", f"test -d '{candidate}' && echo exists"], check=False)
        if r.stdout.strip() == "exists":
            print(f"  [INFO] Oracle dump dir detected: {candidate}")
            return candidate
    return None


def find_oracle_home(pod):
    """Return ORACLE_HOME from the pod, or None."""
    r = exec_pod(pod, ["sh", "-c", "echo $ORACLE_HOME"], check=False)
    home = r.stdout.strip()
    return home if home else None


def resolve_oracle_tool(pod, tool):
    """Find *tool* (e.g. expdp) in pod — check PATH first, then ORACLE_HOME."""
    if check_pod_tool(pod, tool):
        return tool
    oh = find_oracle_home(pod)
    if oh:
        full = f"{oh}/bin/{tool}"
        r = exec_pod(pod, ["test", "-f", full], check=False)
        if r.returncode == 0:
            return full
    # Try a few Oracle home candidates
    for base in ["/u01/app/oracle/product", "/opt/oracle/product"]:
        r = exec_pod(pod, ["sh", "-c", f"find {base} -name {tool} -type f 2>/dev/null | head -1"], check=False)
        if r.stdout.strip():
            return r.stdout.strip()
    return None


def oracle_conn_string():
    return f"{ORACLE_USER}/{ORACLE_PASSWORD}@{ORACLE_SID}"


# ─────────────────────────────────────────────────────────────────────
# MongoDB export / import
# ─────────────────────────────────────────────────────────────────────
def export_mongodb(pod, output_dir, timestamp):
    dump_name = f"mongo_{MONGODB_DB}_{timestamp}"
    pod_path = f"/tmp/{dump_name}"
    local_path = output_dir / dump_name

    print(f"\n[MongoDB] Exporting database '{MONGODB_DB}'...")

    if not check_pod_tool(pod, "mongodump"):
        fatal("mongodump not found inside the MongoDB pod")

    # 1. mongodump inside pod
    run_prepod(pod, "Running mongodump inside pod",
               ["mongodump", f"--db={MONGODB_DB}", f"--out={pod_path}", "--gzip"])

    # 2. Copy archive out
    print(f"  [Copying] {pod_path} -> {local_path}")
    cp_from_pod(pod, pod_path, local_path)

    # 3. Cleanup pod-side dump
    exec_pod(pod, ["rm", "-rf", pod_path])

    print(f"  [OK] MongoDB export saved to: {local_path}")
    return local_path


def import_mongodb(pod, dump_dir):
    print(f"\n[MongoDB] Importing from {dump_dir}...")

    if not check_pod_tool(pod, "mongorestore"):
        fatal("mongorestore not found inside the MongoDB pod")

    pod_path = f"/tmp/mongo_restore_{now_str()}"

    # 1. Copy local dump into pod via tar (reliable directory handling)
    print(f"  [Copying] {dump_dir} -> {pod_path}")
    cp_dir_to_pod(pod, dump_dir, pod_path)

    # 2. mongorestore inside pod
    run_prepod(pod, "Running mongorestore inside pod",
               ["mongorestore", "--drop", f"--dir={pod_path}",
                "--nsInclude", f"{MONGODB_DB}.*", "--gzip"])

    # 3. Cleanup
    exec_pod(pod, ["rm", "-rf", pod_path])

    print(f"  [OK] MongoDB import completed")


# ─────────────────────────────────────────────────────────────────────
# Oracle export / import
# ─────────────────────────────────────────────────────────────────────
def export_oracle(pod, output_dir, timestamp):
    dump_name = f"oracle_{ORACLE_SID}_{timestamp}"
    dump_file = f"{dump_name}.dmp"
    log_file = f"{dump_name}.log"

    print(f"\n[Oracle] Exporting database '{ORACLE_SID}'...")

    expdp = resolve_oracle_tool(pod, "expdp")
    if not expdp:
        fatal("expdp not found inside the Oracle pod. "
              "The container may be a slim image without Data Pump tools.")

    # Quick connectivity test to fail early with a clear message
    sqlplus_tool = resolve_oracle_tool(pod, "sqlplus")
    if sqlplus_tool:
        test_r = exec_pod(pod, [
            "sh", "-c",
            f'echo "exit;" | {sqlplus_tool} -S "{ORACLE_USER}/{ORACLE_PASSWORD}@{ORACLE_SID}" 2>&1'
        ], check=False)
        if test_r.returncode != 0 or "ORA-" in test_r.stdout:
            print(f"  [DIAG] Connection failed. sqlplus output:\n{test_r.stdout.strip()[:500]}")
            err = test_r.stdout.strip()
            if "ORA-01017" in err:
                fatal(f"Invalid username/password for {ORACLE_USER}@{ORACLE_SID}. "
                      "Check --oracle-user, --oracle-password, and --oracle-sid.")
            elif "ORA-12154" in err or "ORA-12541" in err:
                fatal(f"Cannot reach SID/service '{ORACLE_SID}'. "
                      "The SID may differ — check with: kubectl exec -it oracle-db -- lsnrctl services")
            else:
                fatal(f"Oracle connection failed. Check --oracle-sid (current: '{ORACLE_SID}').")

    dump_dir = find_oracle_dump_dir(pod)
    if not dump_dir:
        fatal("Could not locate Oracle DATA_PUMP_DIR inside the pod. "
              "Use --oracle-dump-dir to specify manually.")

    # 1. expdp inside pod
    expdp_args = [
        expdp, oracle_conn_string(),
        f"directory=DATA_PUMP_DIR",
        f"dumpfile={dump_file}",
        f"logfile={log_file}",
        "reuse_dumpfiles=Y",
    ]
    if ORACLE_SCHEMAS:
        expdp_args.append(f"schemas={ORACLE_SCHEMAS}")
    else:
        expdp_args.append("schemas=SYSTEM")

    # expdp exit code 5 = "completed with errors" (non-fatal, dump is valid)
    run_prepod(pod, "Running expdp inside pod", expdp_args, ok_exit_codes=[5])

    # 2. Copy dump + log out
    pod_dump = dump_dir + dump_file
    pod_log = dump_dir + log_file
    local_dump = output_dir / dump_file
    local_log = output_dir / log_file

    print(f"  [Copying] {pod_dump} -> {local_dump}")
    cp_from_pod(pod, pod_dump, local_dump)
    print(f"  [Copying] {pod_log} -> {local_log}")
    cp_from_pod(pod, pod_log, local_log)

    # 3. Cleanup pod-side files
    exec_pod(pod, ["rm", "-f", pod_dump, pod_log])

    print(f"  [OK] Oracle export saved to: {output_dir}")
    return local_dump


def import_oracle(pod, dump_dir):
    print(f"\n[Oracle] Importing from {dump_dir}...")

    impdp = resolve_oracle_tool(pod, "impdp")
    if not impdp:
        fatal("impdp not found inside the Oracle pod. "
              "The container may be a slim image without Data Pump tools.")

    sqlplus_tool = resolve_oracle_tool(pod, "sqlplus")
    if sqlplus_tool:
        test_r = exec_pod(pod, [
            "sh", "-c",
            f'echo "exit;" | {sqlplus_tool} -S "{ORACLE_USER}/{ORACLE_PASSWORD}@{ORACLE_SID}" 2>&1'
        ], check=False)
        if test_r.returncode != 0 or "ORA-" in test_r.stdout:
            err = test_r.stdout.strip()
            if "ORA-01017" in err:
                fatal(f"Invalid username/password for {ORACLE_USER}@{ORACLE_SID}.")
            else:
                fatal(f"Oracle connection failed. Check --oracle-sid (current: '{ORACLE_SID}').")

    oracle_dump_dir = find_oracle_dump_dir(pod)
    if not oracle_dump_dir:
        fatal("Could not locate Oracle DATA_PUMP_DIR inside the pod. "
              "Use --oracle-dump-dir to specify manually.")

    # Find the .dmp file in dump_dir
    dmp_files = list(dump_dir.glob("*.dmp"))
    if not dmp_files:
        fatal(f"No .dmp files found in {dump_dir}")
    dmp_file = dmp_files[0]
    log_file = dmp_file.with_suffix(".log").name
    imp_dump_name = dmp_file.name
    imp_log_name = log_file

    # 1. Copy dump file to pod
    pod_dest = oracle_dump_dir + imp_dump_name
    print(f"  [Copying] {dmp_file} -> {pod_dest}")
    cp_to_pod(pod, dmp_file, oracle_dump_dir.rstrip("/"))

    # 2. impdp inside pod
    impdp_args = [
        impdp, oracle_conn_string(),
        f"directory=DATA_PUMP_DIR",
        f"dumpfile={imp_dump_name}",
        f"logfile={imp_log_name}",
        "table_exists_action=replace",
    ]
    if ORACLE_SCHEMAS:
        impdp_args.append(f"schemas={ORACLE_SCHEMAS}")
    else:
        impdp_args.append("schemas=SYSTEM")

    # impdp exit code 5 = "completed with errors" (non-fatal, restore is valid)
    run_prepod(pod, "Running impdp inside pod", impdp_args, ok_exit_codes=[5])

    # 3. Copy log back
    pod_log = oracle_dump_dir + imp_log_name
    local_log = dump_dir / imp_log_name
    print(f"  [Copying] {pod_log} -> {local_log}")
    cp_from_pod(pod, pod_log, local_log)

    # 4. Cleanup pod-side dump & log
    exec_pod(pod, ["rm", "-f", pod_dest, pod_log])

    print(f"  [OK] Oracle import completed")


# ─────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────
def parse_args(argv=None):
    p = argparse.ArgumentParser(
        description="VibraGuard Database Export/Import Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--export", action="store_true", help="Export databases")
    mode.add_argument("--import", dest="do_import", action="store_true",
                      help="Import databases")

    p.add_argument("--namespace", default=NAMESPACE,
                   help=f"Kubernetes namespace (default: {NAMESPACE})")
    p.add_argument("--oracle-pod", default=None,
                   help="Oracle pod name (bypasses auto-discovery)")
    p.add_argument("--oracle-label", default=ORACLE_LABEL,
                   help=f"Pod label selector for Oracle (default: {ORACLE_LABEL})")
    p.add_argument("--mongodb-pod", default=None,
                   help="MongoDB pod name (bypasses auto-discovery)")
    p.add_argument("--mongodb-label", default=MONGODB_LABEL,
                   help=f"Pod label selector for MongoDB (default: {MONGODB_LABEL})")

    p.add_argument("--oracle-user", default=ORACLE_USER)
    p.add_argument("--oracle-password", default=ORACLE_PASSWORD)
    p.add_argument("--oracle-sid", default=ORACLE_SID,
                   help=f"Oracle SID / service name (default: {ORACLE_SID})")
    p.add_argument("--oracle-schemas", default=None,
                   help="Comma-separated Oracle schemas to export/import "
                        "(default: full database)")
    p.add_argument("--oracle-dump-dir", default=None,
                   help="Oracle DATA_PUMP_DIR path inside the container "
                        "(default: auto-detect)")

    p.add_argument("--mongodb-db", default=MONGODB_DB)

    p.add_argument("--output-dir", default=None,
                   help="Export output directory (default: ./backup_<timestamp>)")
    p.add_argument("--dump-dir", default=None,
                   help="Import source directory containing database dumps")

    db_group = p.add_mutually_exclusive_group()
    db_group.add_argument("--mongodb-only", action="store_true",
                          help="Only process MongoDB")
    db_group.add_argument("--oracle-only", action="store_true",
                          help="Only process Oracle")

    return p.parse_args(argv)


# ─────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────
def main():
    args = parse_args()
    timestamp = now_str()

    # Update globals from args
    global NAMESPACE, ORACLE_LABEL, MONGODB_LABEL
    global ORACLE_USER, ORACLE_PASSWORD, ORACLE_SID, ORACLE_SCHEMAS
    global MONGODB_DB

    NAMESPACE = args.namespace
    ORACLE_LABEL = args.oracle_label
    MONGODB_LABEL = args.mongodb_label
    ORACLE_USER = args.oracle_user
    ORACLE_PASSWORD = args.oracle_password
    ORACLE_SID = args.oracle_sid
    ORACLE_SCHEMAS = args.oracle_schemas
    MONGODB_DB = args.mongodb_db

    # Resolve pod selectors: explicit pod name takes priority, else label + name prefix
    oracle_pod_name = args.oracle_pod
    mongodb_pod_name = args.mongodb_pod
    # Derive name_prefix from label value (e.g. "app=oracle-db" -> "oracle-db")
    oracle_prefix = ORACLE_LABEL.split("=")[-1] if "=" in ORACLE_LABEL else ORACLE_LABEL
    mongodb_prefix = MONGODB_LABEL.split("=")[-1] if "=" in MONGODB_LABEL else MONGODB_LABEL

    if args.oracle_dump_dir:
        ORACLE_DUMP_CANDIDATES.insert(0, args.oracle_dump_dir)

    process_mongo = not args.oracle_only
    process_oracle = not args.mongodb_only

    # ── Export ──────────────────────────────────────────────────────
    if args.export:
        output_dir = Path(args.output_dir or f"backup_{timestamp}")
        output_dir.mkdir(parents=True, exist_ok=True)
        print(f"[INFO] Output directory: {output_dir.resolve()}")
        print(f"[INFO] Timestamp: {timestamp}")

        if process_mongo:
            pod = mongodb_pod_name or get_pod(MONGODB_LABEL, name_prefix=mongodb_prefix)
            export_mongodb(pod, output_dir, timestamp)

        if process_oracle:
            pod = oracle_pod_name or get_pod(ORACLE_LABEL, name_prefix=oracle_prefix)
            detect_oracle_env(pod)
            export_oracle(pod, output_dir, timestamp)

        print(f"\n[DONE] All exports saved under: {output_dir.resolve()}")

    # ── Import ──────────────────────────────────────────────────────
    else:  # do_import
        if not args.dump_dir:
            fatal("--dump-dir is required for import")
        dump_dir = Path(args.dump_dir)
        if not dump_dir.is_dir():
            fatal(f"Dump directory not found: {dump_dir}")
        print(f"[INFO] Import source: {dump_dir.resolve()}")

        if process_mongo:
            # Find the mongo dump directory
            mongo_dirs = sorted(dump_dir.glob("mongo_*"))
            if not mongo_dirs:
                # maybe the user pointed directly to the mongo dump dir
                if dump_dir.name.startswith("mongo_") and dump_dir.is_dir():
                    mongo_dirs = [dump_dir]
            if not mongo_dirs:
                print("[SKIP] No MongoDB dump directory found (looked for mongo_*). "
                      "Use --mongodb-only --dump-dir <path> to skip Oracle check.")
            else:
                pod = mongodb_pod_name or get_pod(MONGODB_LABEL, name_prefix=mongodb_prefix)
                import_mongodb(pod, mongo_dirs[0])

        if process_oracle:
            dmp_files = sorted(dump_dir.glob("oracle_*.dmp"))
            if not dmp_files:
                print("[SKIP] No Oracle dump files found (looked for oracle_*.dmp).")
            else:
                pod = oracle_pod_name or get_pod(ORACLE_LABEL, name_prefix=oracle_prefix)
                detect_oracle_env(pod)
                import_oracle(pod, dump_dir)

        print("\n[DONE] Import completed")


if __name__ == "__main__":
    main()
