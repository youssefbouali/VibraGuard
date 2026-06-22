"""VibraGuard Unified Export/Import Tool

Export or import Oracle, MongoDB, and Blockchain state.
Requires kubectl (for DB ops) and Node.js/npx (for blockchain ops).

Usage:
  python scripts/db_tool.py --export
  python scripts/db_tool.py --export --blockchain-only
  python scripts/db_tool.py --export --no-blockchain --output-dir ./mybackup
  python scripts/db_tool.py --export --mongodb-only
  python scripts/db_tool.py --export --oracle-only --output-dir ./backup_20260619

  python scripts/db_tool.py --import --dump-dir ./backup_20260621_140022
  python scripts/db_tool.py --import --blockchain-only --dump-dir ./backup_20260621_140022
  python scripts/db_tool.py --import --no-blockchain --dump-dir ./backup_20260619
  python scripts/db_tool.py --import --mongodb-only --dump-dir ./backup_20260619
  python scripts/db_tool.py --import --oracle-only --dump-dir ./backup_20260619
"""

import argparse
import subprocess
import sys
import os
import io
import json
import tarfile
import time
import shutil
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

# Path to blockchain-net project root (relative to repo root or absolute)
BLOCKCHAIN_DIR = str(Path(__file__).parent.parent / "blockchain-net")
# Hardhat network to connect to for blockchain ops
BLOCKCHAIN_NETWORK = "localhost"

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


def now_str():
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def get_pod_env(pod, var, ns=None):
    ns = ns or NAMESPACE
    r = kubectl(["exec", "-n", ns, pod, "--", "sh", "-c", f"echo ${var}"], check=False)
    return r.stdout.strip() if r.returncode == 0 else None


def kubectl(args, check=True, capture=True):
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
    ns = ns or NAMESPACE
    if label:
        r = kubectl([
            "get", "pods", "-n", ns, "-l", label,
            "--field-selector", "status.phase=Running",
            "-o", "jsonpath={.items[0].metadata.name}",
        ], check=False)
        pod = r.stdout.strip()
        if pod:
            return pod
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
    ns = ns or NAMESPACE
    full = ["exec", "-n", ns, pod, "--"] + cmd
    return kubectl(full, check=check)


def cp_from_pod(pod, src, dest):
    kubectl(["cp", f"{NAMESPACE}/{pod}:{src}", str(dest)])


def cp_to_pod(pod, src, dest):
    kubectl(["cp", str(src), f"{NAMESPACE}/{pod}:{dest}"])


def cp_dir_to_pod(pod, src_dir, dest_dir):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tar:
        tar.add(str(src_dir), arcname="")
    buf.seek(0)
    exec_pod(pod, ["mkdir", "-p", str(dest_dir)])
    cmd = ["kubectl", "exec", "-n", NAMESPACE, pod, "-i", "--",
           "tar", "xf", "-", "-C", str(dest_dir)]
    subprocess.run(cmd, input=buf.getvalue(), check=True)


def run_prepod(pod, desc, cmd, ok_exit_codes=None):
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
    r = exec_pod(pod, ["which", tool], check=False)
    return r.returncode == 0


def find_pod_tool(pod, tools):
    for tool in tools:
        if check_pod_tool(pod, tool):
            return tool
    return None


# ─────────────────────────────────────────────────────────────────────
# Oracle helpers
# ─────────────────────────────────────────────────────────────────────
def detect_oracle_env(pod):
    global ORACLE_PASSWORD, ORACLE_SID
    pw = get_pod_env(pod, "ORACLE_PASSWORD")
    if pw:
        ORACLE_PASSWORD = pw
        print(f"  [INFO] Detected ORACLE_PASSWORD from pod environment")
    sid = get_pod_env(pod, "ORACLE_SID")
    if sid:
        ORACLE_SID = sid
        print(f"  [INFO] Detected ORACLE_SID={sid} from pod environment")


def find_oracle_dump_dir(pod):
    for candidate in ORACLE_DUMP_CANDIDATES:
        r = exec_pod(pod, ["sh", "-c", f"test -d '{candidate}' && echo exists"], check=False)
        if r.stdout.strip() == "exists":
            print(f"  [INFO] Oracle dump dir detected: {candidate}")
            return candidate
    return None


def find_oracle_home(pod):
    r = exec_pod(pod, ["sh", "-c", "echo $ORACLE_HOME"], check=False)
    home = r.stdout.strip()
    return home if home else None


def resolve_oracle_tool(pod, tool):
    if check_pod_tool(pod, tool):
        return tool
    oh = find_oracle_home(pod)
    if oh:
        full = f"{oh}/bin/{tool}"
        r = exec_pod(pod, ["test", "-f", full], check=False)
        if r.returncode == 0:
            return full
    for base in ["/u01/app/oracle/product", "/opt/oracle/product"]:
        r = exec_pod(pod, ["sh", "-c",
                           f"find {base} -name {tool} -type f 2>/dev/null | head -1"], check=False)
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

    run_prepod(pod, "Running mongodump inside pod",
               ["mongodump", f"--db={MONGODB_DB}", f"--out={pod_path}", "--gzip"])
    print(f"  [Copying] {pod_path} -> {local_path}")
    cp_from_pod(pod, pod_path, local_path)
    exec_pod(pod, ["rm", "-rf", pod_path])
    print(f"  [OK] MongoDB export saved to: {local_path}")
    return local_path


def import_mongodb(pod, dump_dir):
    print(f"\n[MongoDB] Importing from {dump_dir}...")
    if not check_pod_tool(pod, "mongorestore"):
        fatal("mongorestore not found inside the MongoDB pod")

    pod_path = f"/tmp/mongo_restore_{now_str()}"
    print(f"  [Copying] {dump_dir} -> {pod_path}")
    cp_dir_to_pod(pod, dump_dir, pod_path)
    run_prepod(pod, "Running mongorestore inside pod",
               ["mongorestore", "--drop", f"--dir={pod_path}",
                "--nsInclude", f"{MONGODB_DB}.*", "--gzip"])
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
        fatal("expdp not found inside the Oracle pod.")

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
            elif "ORA-12154" in err or "ORA-12541" in err:
                fatal(f"Cannot reach SID/service '{ORACLE_SID}'.")
            else:
                fatal(f"Oracle connection failed.")

    dump_dir = find_oracle_dump_dir(pod)
    if not dump_dir:
        fatal("Could not locate Oracle DATA_PUMP_DIR inside the pod.")

    expdp_args = [expdp, oracle_conn_string(),
                  "directory=DATA_PUMP_DIR",
                  f"dumpfile={dump_file}", f"logfile={log_file}",
                  "reuse_dumpfiles=Y"]
    if ORACLE_SCHEMAS:
        expdp_args.append(f"schemas={ORACLE_SCHEMAS}")
    else:
        expdp_args.append("schemas=SYSTEM")

    run_prepod(pod, "Running expdp inside pod", expdp_args, ok_exit_codes=[5])

    pod_dump = dump_dir + dump_file
    pod_log = dump_dir + log_file
    print(f"  [Copying] {pod_dump} -> {output_dir / dump_file}")
    cp_from_pod(pod, pod_dump, output_dir / dump_file)
    cp_from_pod(pod, pod_log, output_dir / log_file)
    exec_pod(pod, ["rm", "-f", pod_dump, pod_log])
    print(f"  [OK] Oracle export saved to: {output_dir}")


def import_oracle(pod, dump_dir):
    print(f"\n[Oracle] Importing from {dump_dir}...")
    impdp = resolve_oracle_tool(pod, "impdp")
    if not impdp:
        fatal("impdp not found inside the Oracle pod.")

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
                fatal(f"Oracle connection failed.")

    oracle_dump_dir = find_oracle_dump_dir(pod)
    if not oracle_dump_dir:
        fatal("Could not locate Oracle DATA_PUMP_DIR inside the pod.")

    dmp_files = list(dump_dir.glob("*.dmp"))
    if not dmp_files:
        fatal(f"No .dmp files found in {dump_dir}")
    dmp_file = dmp_files[0]
    imp_dump_name = dmp_file.name
    imp_log_name = dmp_file.with_suffix(".log").name

    pod_dest = oracle_dump_dir + imp_dump_name
    print(f"  [Copying] {dmp_file} -> {pod_dest}")
    cp_to_pod(pod, dmp_file, oracle_dump_dir.rstrip("/"))

    impdp_args = [impdp, oracle_conn_string(),
                  "directory=DATA_PUMP_DIR",
                  f"dumpfile={imp_dump_name}", f"logfile={imp_log_name}",
                  "table_exists_action=replace"]
    if ORACLE_SCHEMAS:
        impdp_args.append(f"schemas={ORACLE_SCHEMAS}")
    else:
        impdp_args.append("schemas=SYSTEM")

    run_prepod(pod, "Running impdp inside pod", impdp_args, ok_exit_codes=[5])

    pod_log = oracle_dump_dir + imp_log_name
    cp_from_pod(pod, pod_log, dump_dir / imp_log_name)
    exec_pod(pod, ["rm", "-f", pod_dest, pod_log])
    print(f"  [OK] Oracle import completed")


# ─────────────────────────────────────────────────────────────────────
# Blockchain export / import  (delegates to Hardhat scripts via npx)
# ─────────────────────────────────────────────────────────────────────

# Known network → RPC URL mapping (mirrors hardhat.config.js)
BLOCKCHAIN_RPC_URLS = {
    "localhost": "http://127.0.0.1:8545",
    "server":    "http://vibraguard.mywire.org:30008/blockchain-rpc",
}

# Kubernetes label selector for the blockchain pod
BLOCKCHAIN_POD_LABEL = "app=blockchain"
BLOCKCHAIN_POD_PORT  = 8545
BLOCKCHAIN_LOCAL_PORT = 8545


def _find_npx():
    """Return the correct npx executable for the current platform.
    On Windows npx is npx.cmd — subprocess.run needs that exact name without shell=True.
    Returns a (cmd_list_prefix, use_shell) tuple.
    """
    if sys.platform == "win32":
        if shutil.which("npx.cmd"):
            return ["npx.cmd"], False
        if shutil.which("npx"):
            return ["npx"], True
    else:
        if shutil.which("npx"):
            return ["npx"], False
    fatal(
        "npx not found. Install Node.js (https://nodejs.org) and make sure "
        "it is on your PATH to enable blockchain backup/restore."
    )


def _blockchain_project_dir():
    """Resolve and validate the blockchain-net project directory."""
    d = Path(BLOCKCHAIN_DIR).resolve()
    if not (d / "package.json").exists():
        fatal(
            f"Blockchain project not found at '{d}'.\n"
            "Set --blockchain-dir to the path of the blockchain-net folder."
        )
    return d


def _check_node_reachable(url: str) -> bool:
    """Send eth_blockNumber to *url*. Returns True if the node responds."""
    import urllib.request
    payload = json.dumps(
        {"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1}
    ).encode("utf-8")
    try:
        req = urllib.request.Request(
            url, data=payload,
            headers={"Content-Type": "application/json"}, method="POST",
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            return resp.status == 200
    except Exception:
        return False


def _get_blockchain_pod(ns: str) -> str:
    """Return the name of the running blockchain pod in *ns*."""
    label = BLOCKCHAIN_POD_LABEL
    prefix = label.split("=")[-1]  # "blockchain"
    r = kubectl([
        "get", "pods", "-n", ns, "-l", label,
        "--field-selector", "status.phase=Running",
        "-o", "jsonpath={.items[0].metadata.name}",
    ], check=False)
    pod = r.stdout.strip()
    if pod:
        return pod
    # fallback: name-prefix scan
    r2 = kubectl([
        "get", "pods", "-n", ns,
        "--field-selector", "status.phase=Running",
        "-o", "jsonpath={range .items[*]}{.metadata.name}{\"\\n\"}{end}",
    ], check=False)
    candidates = [p for p in r2.stdout.strip().splitlines() if p.startswith(prefix)]
    if candidates:
        return candidates[0]
    fatal(
        f"No running blockchain pod found in namespace '{ns}' "
        f"(label={label}). Is the cluster running?\n"
        "  kubectl get pods -n vibraguard"
    )


class _PortForward:
    """Context manager: opens kubectl port-forward for the blockchain pod."""

    def __init__(self, ns: str, local_port: int, pod_port: int):
        self.ns = ns
        self.local_port = local_port
        self.pod_port = pod_port
        self._proc = None

    def __enter__(self):
        pod = _get_blockchain_pod(self.ns)
        print(f"  [port-forward] {pod} :{self.pod_port} → localhost:{self.local_port}")
        self._proc = subprocess.Popen(
            ["kubectl", "port-forward", "-n", self.ns,
             pod, f"{self.local_port}:{self.pod_port}"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        # Wait up to 8 s for the port to open
        url = f"http://127.0.0.1:{self.local_port}"
        for i in range(16):
            time.sleep(0.5)
            if _check_node_reachable(url):
                print(f"  [port-forward] Ready on localhost:{self.local_port}")
                return self
        # Still not ready — kill and raise
        self._proc.terminate()
        fatal(
            f"kubectl port-forward started but port {self.local_port} never became reachable.\n"
            "Check that the blockchain pod is healthy:\n"
            f"  kubectl logs -n {self.ns} {pod}"
        )

    def __exit__(self, *_):
        if self._proc and self._proc.poll() is None:
            self._proc.terminate()
            try:
                self._proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self._proc.kill()
        print(f"  [port-forward] Closed")


def _with_localhost(network: str, ns: str):
    """
    Return a context manager that ensures localhost:8545 is reachable.

    - If network == 'localhost' and port 8545 is already open  → no-op ctx
    - If network == 'localhost' and port 8545 is closed        → port-forward
    - Any other network                                         → no-op ctx
    """
    url = BLOCKCHAIN_RPC_URLS.get("localhost", "http://127.0.0.1:8545")

    if network != "localhost" or _check_node_reachable(url):
        # Already reachable or not localhost — nothing to do
        import contextlib
        return contextlib.nullcontext()

    # localhost requested but not reachable → start port-forward
    print(f"  [INFO] localhost:8545 not reachable — starting kubectl port-forward...")
    return _PortForward(ns, BLOCKCHAIN_LOCAL_PORT, BLOCKCHAIN_POD_PORT)


def _run_hardhat(npx, use_shell, script, network, project, env):
    """Run a hardhat script and return the CompletedProcess."""
    return subprocess.run(
        npx + ["hardhat", "run", script, "--network", network],
        cwd=str(project),
        env=env,
        shell=use_shell,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
    )


def _print_hardhat_output(result):
    """Print stdout/stderr from a hardhat subprocess."""
    for line in (result.stdout or "").strip().splitlines():
        print(f"  {line}")
    for line in (result.stderr or "").strip().splitlines():
        if line.strip():
            print(f"  [STDERR] {line}", file=sys.stderr)


def export_blockchain(output_dir: Path, timestamp: str, network: str, ns: str):
    """Export on-chain state via npx hardhat, port-forwarding if needed."""
    print(f"\n[Blockchain] Exporting on-chain state (network: {network})...")
    npx, use_shell = _find_npx()
    project = _blockchain_project_dir()

    deployment_file = project / "deployments" / "WorkOrderRegistry.json"
    if not deployment_file.exists():
        print("  [SKIP] No deployment found at deployments/WorkOrderRegistry.json. "
              "Run: cd vibraguard/blockchain-net && npm run deploy")
        return None

    with _with_localhost(network, ns):
        env = {**os.environ, "FORCE_COLOR": "0"}
        result = _run_hardhat(npx, use_shell, "scripts/export-backup.js", network, project, env)
        _print_hardhat_output(result)

        if result.returncode != 0:
            fatal(f"Blockchain export script failed (exit {result.returncode}).")

        backups_dir = project / "backups"
        candidates = sorted(
            backups_dir.glob("blockchain-backup-*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if not candidates:
            fatal(f"Export ran but no blockchain-backup-*.json found in {backups_dir}.")

        dest = output_dir / candidates[0].name
        shutil.copy2(candidates[0], dest)

    print(f"  [OK] Blockchain backup saved to: {dest}")
    return dest


def import_blockchain(dump_dir: Path, network: str, ns: str):
    """Import on-chain state via npx hardhat, port-forwarding if needed."""
    print(f"\n[Blockchain] Importing on-chain state (network: {network})...")
    npx, use_shell = _find_npx()
    project = _blockchain_project_dir()

    backup_files = sorted(dump_dir.glob("blockchain-backup-*.json"), reverse=True)
    if not backup_files:
        print(f"  [SKIP] No blockchain-backup-*.json found in {dump_dir}.")
        return

    backup_file = backup_files[0]
    print(f"  [INFO] Using backup file: {backup_file.name}")

    deployment_file = project / "deployments" / "WorkOrderRegistry.json"
    if not deployment_file.exists():
        print("  [SKIP] No deployment found. Run: cd vibraguard/blockchain-net && npm run deploy")
        return

    with _with_localhost(network, ns):
        env = {**os.environ, "FORCE_COLOR": "0", "BACKUP_FILE": str(backup_file.resolve())}
        result = _run_hardhat(npx, use_shell, "scripts/import-backup.js", network, project, env)
        _print_hardhat_output(result)

        if result.returncode != 0:
            fatal(f"Blockchain import script failed (exit {result.returncode}).")

    print(f"  [OK] Blockchain import completed")


# ─────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────
def parse_args(argv=None):
    p = argparse.ArgumentParser(
        description="VibraGuard Unified Export/Import Tool (DB + Blockchain)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--export", action="store_true", help="Export all selected data sources")
    mode.add_argument("--import", dest="do_import", action="store_true",
                      help="Import all selected data sources")

    # ── Kubernetes / namespace ──────────────────────────────────────
    p.add_argument("--namespace", default=NAMESPACE)
    p.add_argument("--oracle-pod", default=None)
    p.add_argument("--oracle-label", default=ORACLE_LABEL)
    p.add_argument("--mongodb-pod", default=None)
    p.add_argument("--mongodb-label", default=MONGODB_LABEL)

    # ── Oracle ──────────────────────────────────────────────────────
    p.add_argument("--oracle-user", default=ORACLE_USER)
    p.add_argument("--oracle-password", default=ORACLE_PASSWORD)
    p.add_argument("--oracle-sid", default=ORACLE_SID)
    p.add_argument("--oracle-schemas", default=None)
    p.add_argument("--oracle-dump-dir", default=None)

    # ── MongoDB ─────────────────────────────────────────────────────
    p.add_argument("--mongodb-db", default=MONGODB_DB)

    # ── Blockchain ──────────────────────────────────────────────────
    p.add_argument("--blockchain-dir", default=BLOCKCHAIN_DIR,
                   help=f"Path to blockchain-net project root (default: {BLOCKCHAIN_DIR})")
    p.add_argument("--blockchain-network", default=BLOCKCHAIN_NETWORK,
                   help=f"Hardhat network to connect to (default: {BLOCKCHAIN_NETWORK})")

    # ── What to process ─────────────────────────────────────────────
    scope = p.add_mutually_exclusive_group()
    scope.add_argument("--mongodb-only", action="store_true")
    scope.add_argument("--oracle-only", action="store_true")
    scope.add_argument("--blockchain-only", action="store_true",
                       help="Only process blockchain (skip Oracle and MongoDB)")
    scope.add_argument("--no-blockchain", action="store_true",
                       help="Skip blockchain, process only Oracle and MongoDB")

    # ── Paths ────────────────────────────────────────────────────────
    p.add_argument("--output-dir", default=None,
                   help="Export output directory (default: ./backup_<timestamp>)")
    p.add_argument("--dump-dir", default=None,
                   help="Import source directory containing database dumps")

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
    global MONGODB_DB, BLOCKCHAIN_DIR, BLOCKCHAIN_NETWORK

    NAMESPACE = args.namespace
    ORACLE_LABEL = args.oracle_label
    MONGODB_LABEL = args.mongodb_label
    ORACLE_USER = args.oracle_user
    ORACLE_PASSWORD = args.oracle_password
    ORACLE_SID = args.oracle_sid
    ORACLE_SCHEMAS = args.oracle_schemas
    MONGODB_DB = args.mongodb_db
    BLOCKCHAIN_DIR = args.blockchain_dir
    BLOCKCHAIN_NETWORK = args.blockchain_network

    if args.oracle_dump_dir:
        ORACLE_DUMP_CANDIDATES.insert(0, args.oracle_dump_dir)

    # Derive pod name-prefix from label value  (e.g. "app=oracle-db" → "oracle-db")
    oracle_prefix = ORACLE_LABEL.split("=")[-1] if "=" in ORACLE_LABEL else ORACLE_LABEL
    mongodb_prefix = MONGODB_LABEL.split("=")[-1] if "=" in MONGODB_LABEL else MONGODB_LABEL
    oracle_pod_name = args.oracle_pod
    mongodb_pod_name = args.mongodb_pod

    # Determine which data sources to process
    if args.blockchain_only:
        process_mongo = False
        process_oracle = False
        process_blockchain = True
    elif args.no_blockchain:
        process_mongo = not args.oracle_only
        process_oracle = not args.mongodb_only
        process_blockchain = False
    elif args.mongodb_only:
        process_mongo = True
        process_oracle = False
        process_blockchain = False
    elif args.oracle_only:
        process_mongo = False
        process_oracle = True
        process_blockchain = False
    else:
        # Default: all three
        process_mongo = True
        process_oracle = True
        process_blockchain = True

    # ── Export ──────────────────────────────────────────────────────
    if args.export:
        output_dir = Path(args.output_dir or f"backup_{timestamp}")
        output_dir.mkdir(parents=True, exist_ok=True)
        print(f"[INFO] Output directory : {output_dir.resolve()}")
        print(f"[INFO] Timestamp        : {timestamp}")

        if process_mongo:
            pod = mongodb_pod_name or get_pod(MONGODB_LABEL, name_prefix=mongodb_prefix)
            export_mongodb(pod, output_dir, timestamp)

        if process_oracle:
            pod = oracle_pod_name or get_pod(ORACLE_LABEL, name_prefix=oracle_prefix)
            detect_oracle_env(pod)
            export_oracle(pod, output_dir, timestamp)

        if process_blockchain:
            export_blockchain(output_dir, timestamp, BLOCKCHAIN_NETWORK, NAMESPACE)

        print(f"\n[DONE] All exports saved under: {output_dir.resolve()}")
        _print_backup_contents(output_dir)

    # ── Import ──────────────────────────────────────────────────────
    else:
        if not args.dump_dir:
            fatal("--dump-dir is required for import")
        dump_dir = Path(args.dump_dir)
        if not dump_dir.is_dir():
            fatal(f"Dump directory not found: {dump_dir}")
        print(f"[INFO] Import source: {dump_dir.resolve()}")

        if process_mongo:
            mongo_dirs = sorted(dump_dir.glob("mongo_*"))
            if not mongo_dirs:
                if dump_dir.name.startswith("mongo_") and dump_dir.is_dir():
                    mongo_dirs = [dump_dir]
            if not mongo_dirs:
                print("[SKIP] No MongoDB dump directory found (looked for mongo_*).")
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

        if process_blockchain:
            import_blockchain(dump_dir, BLOCKCHAIN_NETWORK, NAMESPACE)

        print("\n[DONE] Import completed")


def _print_backup_contents(output_dir: Path):
    """Print a summary of what was written to the backup directory."""
    files = sorted(output_dir.iterdir())
    if not files:
        return
    print(f"\n  Backup contents ({output_dir}):")
    for f in files:
        size = f.stat().st_size
        size_str = f"{size:,} bytes" if size < 1_048_576 else f"{size / 1_048_576:.1f} MB"
        print(f"    {f.name}  ({size_str})")


if __name__ == "__main__":
    main()
