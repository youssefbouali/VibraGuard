import paho.mqtt.client as mqtt
from kafka import KafkaProducer
import json
import os
import threading
import time
import orjson

MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")
MQTT_USER = os.getenv("MQTT_USER", "vibraguard")
MQTT_PASS = os.getenv("MQTT_PASS", "VibraGuard2024!")

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")

sent_count = 0
sent_lock = threading.Lock()

producer = None

def get_producer():
    global producer
    if producer is None:
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=orjson.dumps,
                acks=1,
                retries=10,
                enable_idempotence=False,
                linger_ms=5,
                batch_size=262144,
                compression_type=None,
                max_in_flight_requests_per_connection=10,
            )
            print("Kafka producer created")
        except Exception as e:
            print(f"Error creating Kafka producer: {e}")
    return producer

def init_producer_with_retry():
    for i in range(30):
        if get_producer() is not None:
            return True
        print(f"Retrying Kafka connection ({i+1}/30)...")
        time.sleep(2)
    return False

init_producer_with_retry()

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT with result code {rc}")
    client.subscribe(MQTT_TOPIC, qos=1)

def on_message(client, userdata, msg):
    global sent_count
    prod = get_producer()
    if not prod:
        return
    try:
        data = json.loads(msg.payload.decode())
        data['_ts_bridge'] = time.time()
        future = prod.send(KAFKA_TOPIC, data)
        future.add_callback(lambda _: increment_sent())
        future.add_errback(lambda e: print(f"Kafka send error: {e}"))
    except Exception as e:
        print(f"Error processing message: {e}")

def increment_sent():
    global sent_count
    with sent_lock:
        sent_count += 1

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
        with sent_lock:
            print(f"Stats: {sent_count} msgs sent to Kafka")
except KeyboardInterrupt:
    print("Stopping...")
finally:
    client.loop_stop()
    if producer:
        producer.flush()
    client.disconnect()
