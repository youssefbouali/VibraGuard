import paho.mqtt.client as mqtt
from kafka import KafkaProducer
from queue import SimpleQueue


import json
import os
import threading
import time

import orjson

failed_count = 0



MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")
MQTT_USER = os.getenv("MQTT_USER", "vibraguard")
MQTT_PASS = os.getenv("MQTT_PASS", "VibraGuard2024!")

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")

NUM_SENDERS = 4

producers = []
msg_queue = SimpleQueue()
sent_count = 0
sent_lock = threading.Lock()


def create_producer():
    return KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=orjson.dumps,
        acks=1,
                linger_ms=5,
        batch_size=65536,
                max_in_flight_requests_per_connection=5,
        retries=5,
    )

def init_producers():
    for i in range(NUM_SENDERS):
        for j in range(30):
            try:
                p = create_producer()
                producers.append(p)
                print(f"Kafka producer {i+1} created")
                break
            except Exception as e:
                print(f"Retry producer {i+1} ({j+1}/30): {e}")
                time.sleep(2)

init_producers()

def kafka_sender(prod):
    global sent_count, failed_count
    while True:
        data = msg_queue.get()
        try:
            future = prod.send(KAFKA_TOPIC, value=data)
            future.add_callback(lambda _: increment_sent())
            future.add_errback(lambda exc: increment_failed(exc))
        except Exception as e:
            print(f"Kafka send error: {e}")

def increment_sent():
    global sent_count
    with sent_lock:
        sent_count += 1

def increment_failed(exc):
    global failed_count
    failed_count += 1
    print(f"Kafka delivery failed: {exc}")

for prod in producers:
    t = threading.Thread(target=kafka_sender, args=(prod,), daemon=True)
    t.start()

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT with result code {rc}")
    client.subscribe(MQTT_TOPIC, qos=1)

def on_message(client, userdata, msg):
    try:
        data = orjson.loads(msg.payload)
        data['_ts_bridge'] = time.time()
        msg_queue.put_nowait(data)
    except Exception as e:
        print(f"Error processing message: {e}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(MQTT_USER, MQTT_PASS)

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()
    print(f"Bridge running. Ctrl+C to stop.")
    while True:
        time.sleep(60)
        print(f"Stats: sent={sent_count} failed={failed_count}")
except KeyboardInterrupt:
    print("Stopping...")
finally:
    client.loop_stop()
    for p in producers:
        p.flush()
    client.disconnect()
