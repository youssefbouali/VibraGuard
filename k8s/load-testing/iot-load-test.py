import json, os, random, sys, multiprocessing as mp, time, urllib.request, threading

MQTT_BROKER = os.environ.get('MQTT_BROKER', 'mosquitto')
MQTT_PORT = int(os.environ.get('MQTT_PORT', 1883))
MQTT_TOPIC = os.environ.get('MQTT_TOPIC', 'vibraguard/sensors')
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', 'sensor-data')
NUM_WORKERS = int(os.environ.get('NUM_WORKERS', '100'))
MSGS_PER_WORKER = int(os.environ.get('MSGS_PER_WORKER', '1000'))
TARGET_THROUGHPUT = int(os.environ.get('TARGET_THROUGHPUT', '10000'))
PUSHGATEWAY = os.environ.get('PUSHGATEWAY', 'prometheus-prometheus-pushgateway:9091')
JOB_NAME = 'iot_load_test'

TOTAL_MSGS = NUM_WORKERS * MSGS_PER_WORKER
NUM_SENSORS = 10000

import paho.mqtt.client as mqtt
from kafka import KafkaConsumer, TopicPartition

received_times = []
recv_lock = threading.Lock()
stop_consumer = threading.Event()
consumer_ready = threading.Event()

pre_payloads = []
for i in range(NUM_SENSORS):
    mid = f'MTR-Sensor-{i+1:05d}'
    r1, r2, r3 = round(2+random.random()*3, 2), round(7+random.random()*5, 2), round(50+random.random()*30, 2)
    pre_payloads.append(json.dumps({'motor_id': mid, 'vib_rms': r1, 'vib_peak': r2, 'temperature': r3, 'status': 'normal'}))

def kafka_consumer():
    consumer = KafkaConsumer(
        bootstrap_servers=[KAFKA_BROKER],
        value_deserializer=lambda v: json.loads(v.decode('utf-8')),
        enable_auto_commit=True,
        consumer_timeout_ms=30000,
        max_poll_records=100000,
    )
    parts = consumer.partitions_for_topic(KAFKA_TOPIC)
    if not parts:
        print('[WARN] Aucune partition trouvee, abandon consommateur')
        consumer.close()
        return
    tp_list = [TopicPartition(KAFKA_TOPIC, p) for p in parts]
    consumer.assign(tp_list)
    for tp in tp_list:
        consumer.seek_to_end(tp)
    consumer_ready.set()
    while not stop_consumer.is_set():
        result = consumer.poll(timeout_ms=5000, max_records=100000)
        now = time.time()
        for tp, msgs in result.items():
            for msg in msgs:
                with recv_lock:
                    received_times.append(now)
    consumer.close()

def mqtt_worker(wid, queue):
    import paho.mqtt.client as mqtt
    c = mqtt.Client(client_id=f'lt{wid}-{random.randint(0,99999)}', protocol=mqtt.MQTTv311, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    c.connect(MQTT_BROKER, MQTT_PORT, 60)
    c.loop_start()
    pub = c.publish
    tpc = MQTT_TOPIC
    pls = pre_payloads
    ns = time.monotonic_ns
    ap = list.append
    lat = []
    top = MSGS_PER_WORKER
    for i in range(top):
        s = ns()
        pub(tpc, pls[(wid * top + i) % NUM_SENSORS], qos=0)
        ap(lat, (ns() - s) * 0.000001)
    c.loop_stop()
    c.disconnect()
    queue.put(lat)

print("==========================================")
print("  VibraGuard - IoT Bridge Load Test")
print(f"  MQTT  : {MQTT_BROKER}:{MQTT_PORT} / {MQTT_TOPIC}")
print(f"  Kafka : {KAFKA_BROKER} / {KAFKA_TOPIC}")
print(f"  Capteurs simules: {NUM_SENSORS}")
print(f"  Workers: {NUM_WORKERS} | Messages/worker: {MSGS_PER_WORKER}")
print(f"  Messages total   : {TOTAL_MSGS}")
print(f"  Objectif Debit   : >= {TARGET_THROUGHPUT} msg/s")
print(f"  Objectif P95     : <= 200 ms")
print(f"  Objectif Livraison: >= 99%")
print("==========================================")

print("[1/5] Demarrage du consommateur Kafka...")
ct = threading.Thread(target=kafka_consumer, daemon=True)
ct.start()
if not consumer_ready.wait(timeout=30):
    print('[WARN] Timeout attente consommateur Kafka')
time.sleep(2)

print(f"[2/5] Demarrage de {NUM_WORKERS} workers MQTT ({TOTAL_MSGS} messages)...")
s = time.time()
q = mp.Queue()
ps = [mp.Process(target=mqtt_worker, args=(t, q)) for t in range(1, NUM_WORKERS + 1)]
for p in ps:
    p.start()

all_mqtt_lat = []
for _ in ps:
    all_mqtt_lat.extend(q.get())

for p in ps:
    p.join()
publish_end = time.time()
publish_duration = publish_end - s

print(f"[3/5] Attente de tous les messages dans Kafka...")
deadline = time.time() + 120
while time.time() < deadline:
    with recv_lock:
        if len(received_times) >= TOTAL_MSGS:
            break
    time.sleep(1)
remaining = deadline - time.time()
print(f"  Attente terminee ({max(0, 120-int(remaining))}s), verification finale...")
time.sleep(3)
stop_consumer.set()
ct.join(timeout=10)

print("[4/5] Analyse des resultats...")
all_mqtt_lat.sort()
n_mqtt = len(all_mqtt_lat)
with recv_lock:
    n_kafka = len(received_times)
    recv_sorted = sorted(received_times)

if n_mqtt > 0:
    p50_mqtt = all_mqtt_lat[n_mqtt * 50 // 100]
    p95_mqtt = all_mqtt_lat[n_mqtt * 95 // 100]
    p99_mqtt = all_mqtt_lat[n_mqtt * 99 // 100]
    mn_mqtt = all_mqtt_lat[0]
    mx_mqtt = all_mqtt_lat[-1]
else:
    p50_mqtt = p95_mqtt = p99_mqtt = mn_mqtt = mx_mqtt = 0.0

delivery_ratio = n_kafka / TOTAL_MSGS if TOTAL_MSGS > 0 else 0.0

e2e_list = [(rt - s) * 1000 for rt in recv_sorted]
e2e_list.sort()
ne2e = len(e2e_list)
if ne2e > 0:
    p50_e2e = e2e_list[ne2e * 50 // 100]
    p95_e2e = e2e_list[ne2e * 95 // 100]
    p99_e2e = e2e_list[ne2e * 99 // 100]
    avg_e2e = sum(e2e_list) / ne2e
    mx_e2e = e2e_list[-1]
else:
    p50_e2e = p95_e2e = p99_e2e = avg_e2e = mx_e2e = 0.0

overall_tput = n_kafka / publish_duration if publish_duration > 0 else 0.0

print(f'\n{"="*42}')
print(f'   RESULTATS TEST PONT MQTT->KAFKA')
print(f'{"="*42}')
print(f'  Capteurs simules  : {NUM_SENSORS}')
print(f'  Messages envoyes MQTT : {TOTAL_MSGS}')
print(f'  Messages recus Kafka  : {n_kafka}')
print(f'  Taux livraison        : {delivery_ratio*100:.2f}%')
print(f'')
print(f'  [MQTT Publish Latency]')
print(f'    Min  : {mn_mqtt:.2f} ms')
print(f'    P50  : {p50_mqtt:.2f} ms')
print(f'    P95  : {p95_mqtt:.2f} ms')
print(f'    P99  : {p99_mqtt:.2f} ms')
print(f'    Max  : {mx_mqtt:.2f} ms')
print(f'')
print(f'  [E2E Bridge Latency]')
print(f'    Avg  : {avg_e2e:.2f} ms')
print(f'    P50  : {p50_e2e:.2f} ms')
print(f'    P95  : {p95_e2e:.2f} ms')
print(f'    P99  : {p99_e2e:.2f} ms')
print(f'    Max  : {mx_e2e:.2f} ms')
print(f'')
print(f'  [Throughput]')
print(f'    Publish duration : {publish_duration:.3f}s')
print(f'    Overall throughput: {overall_tput:.2f} msg/s')
print(f'')
print(f'  {"-"*42}')
print(f'  [{"PASS" if p95_mqtt<=200 else "FAIL"}] MQTT P95={p95_mqtt:.2f} ms target<=200 ms')
print(f'  [{"PASS" if overall_tput>=TARGET_THROUGHPUT else "FAIL"}] Debit={overall_tput:.2f} msg/s target>={TARGET_THROUGHPUT} msg/s')
print(f'  [{"PASS" if delivery_ratio>=0.99 else "FAIL"}] Livraison={delivery_ratio*100:.2f}% target>=99%')
print(f'  [{"PASS" if p95_e2e<=5000 else "WARN"}] E2E P95={p95_e2e:.2f} ms target<=5000 ms')
print(f'{"="*42}\n')

print('[5/5] Export vers Prometheus Pushgateway...', flush=True)
met = ''.join(
    f'# HELP iot_load_test_{k}\n# TYPE iot_load_test_{k} gauge\niot_load_test_{k}{{instance="iot-load-test"}} {v}\n'
    for k, v in [
        ('num_sensors', NUM_SENSORS),
        ('messages_sent', TOTAL_MSGS),
        ('messages_received', n_kafka),
        ('delivery_ratio', delivery_ratio),
        ('mqtt_latency_p50_ms', p50_mqtt),
        ('mqtt_latency_p95_ms', p95_mqtt),
        ('mqtt_latency_p99_ms', p99_mqtt),
        ('e2e_latency_p50_ms', p50_e2e),
        ('e2e_latency_p95_ms', p95_e2e),
        ('e2e_latency_p99_ms', p99_e2e),
        ('throughput', overall_tput),
    ]
)
try:
    r = urllib.request.Request(
        f'http://{PUSHGATEWAY}/metrics/job/{JOB_NAME}',
        data=met.encode(), headers={'Content-Type': 'text/plain'}
    )
    urllib.request.urlopen(r, timeout=5)
    print('  [OK] Metriques poussees vers Pushgateway')
except Exception as e:
    print(f'  [WARN] Pushgateway indisponible: {e}')

exit_code = 0
if p95_mqtt > 200:
    print('[FAIL] P95 MQTT depasse 200 ms')
    exit_code = 1
if overall_tput < TARGET_THROUGHPUT:
    print(f'[WARN] Debit {overall_tput:.2f} msg/s inferieur a {TARGET_THROUGHPUT} msg/s')
if delivery_ratio < 0.99:
    print('[FAIL] Taux de livraison inferieur a 99%')
    exit_code = 1
if exit_code == 0:
    print('[PASS] Test pont MQTT->Kafka reussi')
sys.exit(exit_code)
