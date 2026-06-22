import json, os, random, sys, multiprocessing as mp, time, urllib.request

MQTT_BROKER = os.environ.get('MQTT_BROKER', 'mosquitto')
MQTT_PORT = int(os.environ.get('MQTT_PORT', 1883))
TOPIC = os.environ.get('TOPIC', 'vibraguard/sensors')
MQTT_USER = os.environ.get('MQTT_USER', 'vibraguard')
MQTT_PASS = os.environ.get('MQTT_PASS', 'VibraGuard2024!')

NUM_WORKERS = int(os.environ.get('NUM_WORKERS', '8'))
MSGS_PER_WORKER = int(os.environ.get('MSGS_PER_WORKER', '15000'))
PUSHGATEWAY = os.environ.get('PUSHGATEWAY', 'prometheus-prometheus-pushgateway:9091')
JOB_NAME = 'mqtt_load_test'

import paho.mqtt.client as mqtt

pre_payloads = []
for i in range(128):
    mid = f'MTR-Sensor-{i+1}'
    r1, r2, r3 = round(2+random.random()*3, 2), round(7+random.random()*5, 2), round(50+random.random()*30, 2)
    pre_payloads.append(json.dumps({'motor_id': mid, 'vib_rms': r1, 'vib_peak': r2, 'temperature': r3, 'status': 'normal'}))

def worker(wid, queue):
    import paho.mqtt.client as mqtt
    c = mqtt.Client(client_id=f'lt{wid}-{random.randint(0,99999)}', protocol=mqtt.MQTTv311, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    c.username_pw_set(MQTT_USER, MQTT_PASS)
    c.connect(MQTT_BROKER, MQTT_PORT, 60)
    c.loop_start()
    pub = c.publish
    tpc = TOPIC
    pls = pre_payloads
    ns = time.monotonic_ns
    ap = list.append
    lat = []
    top = MSGS_PER_WORKER
    for i in range(top):
        s = ns()
        pub(tpc, pls[i & 127], qos=0)
        ap(lat, (ns() - s) * 0.000001)
    c.loop_stop(); c.disconnect()
    queue.put(lat)

print(f'[3/5] Demarrage ({NUM_WORKERS} workers, multiprocessing)...', flush=True)
s = time.time()
q = mp.Queue()
ps = [mp.Process(target=worker, args=(t, q)) for t in range(1, NUM_WORKERS+1)]
for p in ps: p.start()
all_lat = []
for _ in ps:
    all_lat.extend(q.get())
for p in ps: p.join()
d = time.time()-s

print('[4/5] Analyse...', flush=True)
all_lat.sort()
n = len(all_lat)
if n > 0:
    p50, p95, p99 = all_lat[n*50//100], all_lat[n*95//100], all_lat[n*99//100]
    mn, mx, tput = all_lat[0], all_lat[-1], n/d
    print(f'\n{"="*42}\n   RESULTATS DU TEST MQTT\n{"="*42}')
    print(f'  Messages envoyes  : {n}')
    print(f'  Duree totale      : {d:.3f}s')
    print(f'  Debit (Throughput): {tput:.2f} msg/s')
    print(f'  Latence Min       : {mn:.2f} ms')
    print(f'  Latence P50       : {p50:.2f} ms')
    print(f'  Latence P95       : {p95:.2f} ms')
    print(f'  Latence P99       : {p99:.2f} ms')
    print(f'  Latence Max       : {mx:.2f} ms\n{"-"*42}')
    print(f'  [{"PASS" if p95<=200 else "FAIL"}] P95={p95:.2f} ms {"<=" if p95<=200 else ">"} 200 ms')
    print(f'  [{"PASS" if tput>=12000 else "WARN"}] Debit={tput:.2f} msg/s {">=" if tput>=12000 else "<"} 12000 msg/s')
    print(f'{"="*42}\n')
    print('[5/5] Export vers Prometheus Pushgateway...', flush=True)
    met = ''.join(f'# HELP mqtt_load_test_{k}\n# TYPE mqtt_load_test_{k} gauge\nmqtt_load_test_{k}{{instance="mqtt-load-test"}} {v}\n' for k,v in [('throughput',tput),('latency_p50_ms',p50),('latency_p95_ms',p95),('latency_p99_ms',p99),('latency_min_ms',mn),('latency_max_ms',mx),('total_records',n)])
    try:
        r = urllib.request.Request(f'http://{PUSHGATEWAY}/metrics/job/{JOB_NAME}', data=met.encode(), headers={'Content-Type': 'text/plain'})
        urllib.request.urlopen(r, timeout=5)
        print('  [OK] Metriques poussees vers Pushgateway')
    except Exception as e:
        print(f'  [WARN] Pushgateway indisponible: {e}')
else:
    print('[ERROR] Aucune latence collectee'); sys.exit(1)
