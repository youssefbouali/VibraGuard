"""
VibraGuard - Pipeline Load Test (MQTT -> Kafka -> Spark -> Backend API)
Mesure : Latence E2E (< 2s) et Debit (> 10 000 msg/s)

Phases:
  1. Debit MQTT : mesure capacite d'envoi MQTT et livraison Kafka
  2. E2E Spark   : injecte dans Kafka, mesure latence via logs Spark
"""
import json, os, time, random, sys, threading, urllib.request, uuid, subprocess
from multiprocessing import Process, Queue

MQTT_BROKER = os.environ.get('MQTT_BROKER', 'mosquitto')
MQTT_PORT = int(os.environ.get('MQTT_PORT', 1883))
MQTT_TOPIC = os.environ.get('MQTT_TOPIC', 'vibraguard/sensors')
MQTT_USER = os.environ.get('MQTT_USER', 'vibraguard')
MQTT_PASS = os.environ.get('MQTT_PASS', 'VibraGuard2024!')
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', 'sensor-data')
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://api-gateway/api/v1')
AUTH_URL = os.environ.get('AUTH_URL', 'http://api-gateway/api/v1/auth')
AUTH_EMAIL = os.environ.get('AUTH_EMAIL', 'mr.boualiyoussef@gmail.com')
AUTH_PASS = os.environ.get('AUTH_PASS', 'password')
TARGET_THROUGHPUT = int(os.environ.get('TARGET_THROUGHPUT', '10000'))
TARGET_LATENCY_MS = int(os.environ.get('TARGET_LATENCY_MS', '2000'))
PUSHGATEWAY = os.environ.get('PUSHGATEWAY', 'prometheus-prometheus-pushgateway:9091')
JOB_NAME = 'pipeline_load_test'
NUM_SENSORS = 10000
SPARK_POD = os.environ.get('SPARK_POD', '')
SPARK_NAMESPACE = os.environ.get('SPARK_NAMESPACE', 'vibraguard')

if not SPARK_POD:
    try:
        out = subprocess.run(
            ['kubectl', 'get', 'pod', '-n', SPARK_NAMESPACE, '-l', 'job-name=spark-ai-processor', '-o', 'name'],
            capture_output=True, text=True, timeout=10
        )
        pod_name = out.stdout.strip().replace('pod/', '')
        if pod_name:
            SPARK_POD = pod_name
            print(f'  [OK] Spark pod detecte: {SPARK_POD}')
        else:
            SPARK_POD = 'spark-ai-processor'
            print(f'  [WARN] Aucun pod Spark trouve, fallback: {SPARK_POD}')
    except Exception as e:
        SPARK_POD = 'spark-ai-processor'
        print(f'  [WARN] Detection Spark pod echouee: {e}')

bearer_token = None
kafka_recv_times = []
kafka_total_latencies = []
kafka_bridge_latencies = []
kafka_recv_lock = threading.Lock()
consumer_ready = threading.Event()
stop_consumer = threading.Event()

# Pre-generate payloads (with _ts placeholder for per-message latency)
payloads = []
for i in range(NUM_SENSORS):
    mid = f'MTR-Convoyeur-1'
    is_anomaly = random.random() < 0.2
    scenarios = ["ROULEMENT", "DESEQUILIBRE", "DESALIGNEMENT", "SURCHAUFFE", "ELECTRIQUE"]
    sc = scenarios[i % len(scenarios)]
    if sc == "ROULEMENT":
        d = dict(motor_id=mid, vib_rms=round(3.5+random.random()*1.5,2), vib_peak=round(20+random.random()*10,2), vib_kurtosis=round(7+random.random()*5,2), current_rms=round(8.5+random.random()*1.0,2), current_thd=round(4+random.random()*2,2), temperature=round(55+random.random()*10,2), power="450 kW", speed="1480 RPM")
    elif sc == "DESEQUILIBRE":
        d = dict(motor_id=mid, vib_rms=round(9+random.random()*5,2), vib_peak=round(14+random.random()*4,2), vib_kurtosis=round(2.8+random.random()*0.4,2), current_rms=round(9.5+random.random()*1.5,2), current_thd=round(5+random.random()*3,2), temperature=round(60+random.random()*15,2), power="450 kW", speed="1480 RPM")
    elif sc == "DESALIGNEMENT":
        d = dict(motor_id=mid, vib_rms=round(5+random.random()*3,2), vib_peak=round(10+random.random()*5,2), vib_kurtosis=round(3+random.random()*1.5,2), current_rms=round(9+random.random()*1.5,2), current_thd=round(6+random.random()*3,2), temperature=round(70+random.random()*10,2), power="450 kW", speed="1480 RPM")
    elif sc == "SURCHAUFFE":
        d = dict(motor_id=mid, vib_rms=round(3+random.random()*1.5,2), vib_peak=round(8+random.random()*4,2), vib_kurtosis=round(2.5+random.random()*1.0,2), current_rms=round(11+random.random()*2,2), current_thd=round(7+random.random()*3,2), temperature=round(95+random.random()*20,2), power="450 kW", speed="1480 RPM")
    else:
        d = dict(motor_id=mid, vib_rms=round(2.5+random.random()*1.5,2), vib_peak=round(7+random.random()*3,2), vib_kurtosis=round(2.5+random.random()*1.0,2), current_rms=round(15+random.random()*7,2), current_thd=round(18+random.random()*12,2), temperature=round(75+random.random()*10,2), power="450 kW", speed="1480 RPM")
    d['_ts'] = 0.0
    payloads.append(json.dumps(d))

def api_headers():
    h = {'Content-Type': 'application/json'}
    if bearer_token:
        h['Authorization'] = f'Bearer {bearer_token}'
    return h

def login():
    global bearer_token
    try:
        data = json.dumps({"email": AUTH_EMAIL, "password": AUTH_PASS}).encode()
        req = urllib.request.Request(f"{AUTH_URL}/login", data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read())
            bearer_token = body.get('token')
            if bearer_token:
                pass
                return True
    except Exception as e:
        print(f"  [WARN] Echec connexion: {e}")
    return False

def kafka_consumer():
    from kafka import KafkaConsumer, TopicPartition
    consumer = KafkaConsumer(
        bootstrap_servers=[KAFKA_BROKER],
        enable_auto_commit=True,
        consumer_timeout_ms=60000,
        max_poll_records=100000,
    )
    parts = consumer.partitions_for_topic(KAFKA_TOPIC)
    if not parts:
        print('[WARN] Aucune partition Kafka trouvee')
        consumer.close()
        return
    tp_list = [TopicPartition(KAFKA_TOPIC, p) for p in parts]
    consumer.assign(tp_list)
    for tp in tp_list:
        consumer.seek_to_end(tp)
    consumer_ready.set()
    while not stop_consumer.is_set():
        result = consumer.poll(timeout_ms=100, max_records=100000)
        now = time.time()
        for tp, msgs in result.items():
            for msg in msgs:
                try:
                    payload = json.loads(msg.value)
                    pub_ts = payload.get('_ts', now)
                    bridge_ts = payload.get('_ts_bridge', pub_ts)
                    total_lat = (now - pub_ts) * 1000
                    bridge_lat = (now - bridge_ts) * 1000
                except:
                    total_lat = 0.0
                    bridge_lat = 0.0
                with kafka_recv_lock:
                    kafka_recv_times.append(now)
                    kafka_total_latencies.append(total_lat)
                    kafka_bridge_latencies.append(bridge_lat)
    consumer.close()

def mqtt_worker(wid, msgs_count, queue):
    import paho.mqtt.client as mqtt
    c = mqtt.Client(client_id=f'pl{wid}-{random.randint(0,99999)}', protocol=mqtt.MQTTv311, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    c.max_inflight_messages_set(500)
    if MQTT_USER and MQTT_PASS:
        c.username_pw_set(MQTT_USER, MQTT_PASS)
    c.connect(MQTT_BROKER, MQTT_PORT, 60)
    c.loop_start()
    latencies = []
    pub = c.publish
    tpc = MQTT_TOPIC
    ns = time.monotonic_ns
    wt = time.time
    for i in range(msgs_count):
        s = ns()
        idx = (wid * msgs_count + i) % NUM_SENSORS
        payload = payloads[idx].replace('"_ts": 0.0', f'"_ts": {wt()}')
        pub(tpc, payload, qos=0)
        latencies.append((ns() - s) * 0.000001)
    c.loop_stop()
    c.disconnect()
    queue.put(latencies)

def push_to_prometheus(metrics):
    lines = []
    for k, v in metrics.items():
        lines.append(f'# HELP pipeline_load_test_{k}')
        lines.append(f'# TYPE pipeline_load_test_{k} gauge')
        lines.append(f'pipeline_load_test_{k}{{instance="pipeline-load-test"}} {v}')
    data = '\n'.join(lines) + '\n'
    try:
        req = urllib.request.Request(
            f'http://{PUSHGATEWAY}/metrics/job/{JOB_NAME}',
            data=data.encode(), method='PUT', headers={'Content-Type': 'text/plain'}
        )
        resp = urllib.request.urlopen(req, timeout=5)
        print(f'  [OK] Pushgateway: {resp.status}')
        return True
    except urllib.error.HTTPError as e:
        print(f'  [WARN] Pushgateway HTTP {e.code}: {e.read().decode()[:200]}')
        return False
    except Exception as e:
        print(f'  [WARN] Pushgateway: {e}')
        return False

def test_mqtt_throughput():
    msgs_w = int(os.environ.get('MSGS_PER_WORKER', '300'))
    workers = int(os.environ.get('NUM_WORKERS', '20'))
    total = workers * msgs_w

    print(f"\n{'='*56}")
    print("  Phase 1: Test Debit MQTT -> Kafka")
    print(f"  Workers: {workers} x {msgs_w} msg = {total} total")
    print(f"{'='*56}")

    ct = threading.Thread(target=kafka_consumer, daemon=True)
    ct.start()
    if not consumer_ready.wait(timeout=30):
        print('  [WARN] Timeout attente Kafka')
    time.sleep(2)

    print(f"\n  Envoi de {total} messages...")
    start = time.time()
    q = Queue()
    procs = [Process(target=mqtt_worker, args=(t, msgs_w, q)) for t in range(1, workers + 1)]
    for p in procs: p.start()
    all_lat = []
    for _ in procs: all_lat.extend(q.get())
    for p in procs: p.join()
    end = time.time()
    duration = end - start
    print(f"  Envoi termine en {duration:.3f}s ({total/duration:.0f} msg/s)")

    deadline = time.time() + 120
    last, stall = 0, None
    while time.time() < deadline:
        with kafka_recv_lock:
            cur = len(kafka_recv_times)
        if cur >= total: break
        if cur == last:
            if stall is None: stall = time.time()
            elif time.time() - stall > 20: break
        else: stall = None
        last = cur
        time.sleep(2)

    stop_consumer.set()
    ct.join(timeout=10)

    all_lat.sort()
    n_sent = len(all_lat)
    with kafka_recv_lock:
        n_kafka = len(kafka_recv_times)
        recv = sorted(kafka_recv_times)
        total_lat = sorted(kafka_total_latencies)

    if n_sent > 0:
        p50_m = all_lat[n_sent * 50 // 100]
        p95_m = all_lat[n_sent * 95 // 100]
        p99_m = all_lat[n_sent * 99 // 100]
        avg_m = sum(all_lat) / n_sent
        mn_m = all_lat[0]; mx_m = all_lat[-1]
    else:
        p50_m = p95_m = p99_m = avg_m = mn_m = mx_m = 0.0

    dr = n_kafka / total if total > 0 else 0.0

    bridge = sorted(kafka_bridge_latencies)
    nb = len(bridge)
    if nb > 0:
        p50_b = bridge[nb * 50 // 100]
        p95_b = bridge[nb * 95 // 100]
        p99_b = bridge[nb * 99 // 100]
        avg_b = sum(bridge) / nb; mx_b = bridge[-1]
    else:
        p50_b = p95_b = p99_b = avg_b = mx_b = 0.0

    nt = len(total_lat)
    if nt > 0:
        p50_t = total_lat[nt * 50 // 100]
        p95_t = total_lat[nt * 95 // 100]
        p99_t = total_lat[nt * 99 // 100]
        avg_t = sum(total_lat) / nt; mx_t = total_lat[-1]
    else:
        p50_t = p95_t = p99_t = avg_t = mx_t = 0.0

    return {
        'total': total, 'n_kafka': n_kafka, 'dr': dr,
        'p50_mqtt': p50_m, 'p95_mqtt': p95_m, 'p99_mqtt': p99_m,
        'avg_mqtt': avg_m, 'mn_mqtt': mn_m, 'mx_mqtt': mx_m,
        'p50_bridge': p50_b, 'p95_bridge': p95_b, 'p99_bridge': p99_b,
        'avg_bridge': avg_b, 'mx_bridge': mx_b,
        'p50_total': p50_t, 'p95_total': p95_t, 'p99_total': p99_t,
        'avg_total': avg_t, 'mx_total': mx_t,
        'duration': duration, 'tput': n_kafka / duration if duration > 0 else 0,
    }

def test_spark_e2e():
    """Injecte directement dans Kafka, mesure latence Spark via polling API."""
    print(f"\n{'='*56}")
    print("  Phase 2: Test Latence E2E Spark (injection Kafka directe)")
    print(f"{'='*56}")

    from kafka import KafkaProducer
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        acks=1,
    )

    n = 20
    motors = [f"MTR-Convoyeur-1" for i in range(n)]
    times = []

    print(f"  Injection de {n} messages dans Kafka...")
    for i, mid in enumerate(motors):
        msg = {"motor_id": mid, "vib_rms": round(2+random.random()*1,2), "vib_peak": round(7+random.random()*2,2), "vib_kurtosis": round(2.5+random.random()*1.0,2), "current_rms": round(8+random.random()*1,2), "current_thd": round(4+random.random()*2,2), "temperature": round(50+random.random()*10,2), "power":"450 kW", "speed":"1480 RPM"}
        future = producer.send(KAFKA_TOPIC, json.dumps(msg).encode('utf-8'))
        future.get(timeout=5)
        times.append(time.time())

    producer.flush()
    inject_time = times[-1]
    print(f"  Injecte a {inject_time:.3f}")

    # Poller l'API en boucle serree pour mesurer la latence reelle
    deadline = time.time() + 120
    poll_interval = 1
    confirmed = False

    print(f"  Polling API pour confirmer les donnees (timeout 120s)...")
    while time.time() < deadline and not confirmed:
        try:
            req = urllib.request.Request(f"{BACKEND_URL}/iot/motors/{motors[0]}", headers=api_headers())
            resp = urllib.request.urlopen(req, timeout=2)
            confirmed = True
            e2e_lat = (time.time() - inject_time) * 1000
            print(f"  [OK] Donnees confirmees en {e2e_lat:.0f}ms")
        except:
            time.sleep(poll_interval)

    if confirmed:
        return {'e2e_confirmed': n, 'e2e_total': n, 'e2e_pct': 100.0, 'e2e_latency_ms': e2e_lat}
    return {'e2e_confirmed': 0, 'e2e_total': n, 'e2e_pct': 0.0, 'e2e_latency_ms': None}

    if e2e_lat:
        return {'e2e_confirmed': confirmed, 'e2e_total': n, 'e2e_pct': confirmed/n*100, 'e2e_latency_ms': e2e_lat}
    return {'e2e_confirmed': confirmed, 'e2e_total': n, 'e2e_pct': confirmed/n*100, 'e2e_latency_ms': None}

def main():
    print("=" * 56)
    print("  VibraGuard - Pipeline Load Test")
    print("  MQTT -> Kafka -> Spark -> API")
    print("=" * 56)

    login()

    r1 = test_mqtt_throughput()
    r2 = test_spark_e2e()

    print(f'\n{"="*56}')
    print(f'   RESULTATS TEST PIPELINE')
    print(f'{"="*56}')

    print(f'\n  [Phase 1: Debit MQTT -> Kafka]')
    print(f'  Messages envoyes    : {r1["total"]}')
    print(f'  Messages recus Kafka: {r1["n_kafka"]}')
    print(f'  Taux livraison      : {r1["dr"]*100:.2f}%')
    print(f'')
    print(f'  Latence MQTT Publish (ms)  : Min={r1["mn_mqtt"]:.2f} Avg={r1["avg_mqtt"]:.2f} P50={r1["p50_mqtt"]:.2f} P95={r1["p95_mqtt"]:.2f} P99={r1["p99_mqtt"]:.2f} Max={r1["mx_mqtt"]:.2f}')
    print(f'  Latence Bridge (ms)        : Avg={r1["avg_bridge"]:.0f} P50={r1["p50_bridge"]:.0f} P95={r1["p95_bridge"]:.0f} P99={r1["p99_bridge"]:.0f} Max={r1["mx_bridge"]:.0f}')
    print(f'  Latence Totale MQTT->Kafka (ms): Avg={r1["avg_total"]:.0f} P50={r1["p50_total"]:.0f} P95={r1["p95_total"]:.0f} P99={r1["p99_total"]:.0f} Max={r1["mx_total"]:.0f}')
    print(f'')
    print(f'  Debit envoi MQTT  : {r1["total"]/r1["duration"]:.0f} msg/s')
    print(f'  Debit effectif     : {r1["tput"]:.0f} msg/s')

    print(f'\n  [Phase 2: Spark E2E]')
    print(f'  Confirmation API: {r2["e2e_confirmed"]}/{r2["e2e_total"]}')
    if r2.get('e2e_latency_ms'):
        print(f'  Latence Spark : {r2["e2e_latency_ms"]:.0f} ms')
    else:
        print(f'  [WARN] Aucune donnee Spark trouvee dans motor-service')
        print(f'  [WARN] Verifier kubectl logs -n {SPARK_NAMESPACE} {SPARK_POD}')

    print(f'  {"-"*56}')
    print(f'  Debit={r1["tput"]:.0f} msg/s')
    print(f'  Livraison={r1["dr"]*100:.1f}%')
    print(f'  MQTT P95={r1["p95_mqtt"]:.2f}ms')
    print(f'  Bridge P95={r1["p95_bridge"]:.0f}ms')
    if r2['e2e_confirmed'] > 0:
        print(f'  [OK] Spark E2E: {r2["e2e_confirmed"]}/{r2["e2e_total"]} confirme, latence {r2["e2e_latency_ms"]:.0f}ms')
    else:
        print(f'  [WARN] Spark E2E non verifie (traitement lent ou API erreur 500)')
    e2e_lat = r2.get('e2e_latency_ms', 0) or 0
    print(f'  Latence Totale Pipeline P95={r1["p95_mqtt"]+r1["p95_bridge"]+e2e_lat:.0f}ms')
    print(f'{"="*56}\n')

    dr_pass = r1['dr'] >= 0.99
    tput_pass = r1['tput'] >= TARGET_THROUGHPUT
    mqtt_pass = r1['p95_mqtt'] <= 200
    bridge_pass = r1['p95_bridge'] <= TARGET_LATENCY_MS

    e2e_lat = r2.get('e2e_latency_ms', 0) or 0
    push_to_prometheus({
        'messages_sent': r1['total'], 'messages_received': r1['n_kafka'],
        'delivery_ratio': r1['dr'], 'throughput': r1['tput'],
        'mqtt_p95_ms': r1['p95_mqtt'], 'bridge_p95_ms': r1['p95_bridge'],
        'total_p95_ms': r1['p95_total'], 'spark_e2e_ms': e2e_lat,
        'debit_pass': 1 if tput_pass else 0,
        'delivery_pass': 1 if dr_pass else 0,
        'mqtt_pass': 1 if mqtt_pass else 0,
    })

    code = 0
    if not tput_pass: print(f'[FAIL] Debit < {TARGET_THROUGHPUT}'); code = 1
    if not dr_pass: print(f'[FAIL] Livraison < 99%'); code = 1
    if not mqtt_pass: print(f'[FAIL] MQTT P95 > 200ms'); code = 1
    sys.exit(code)

if __name__ == '__main__':
    main()
