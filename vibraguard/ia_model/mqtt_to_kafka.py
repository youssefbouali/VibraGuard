import paho.mqtt.client as mqtt
from kafka import KafkaProducer
from queue import Queue
import json
import os
import threading
import time

MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")
MQTT_USER = os.getenv("MQTT_USER", "vibraguard")
MQTT_PASS = os.getenv("MQTT_PASS", "VibraGuard2024!")

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")

producer = None
msg_queue = Queue(maxsize=10000)
sent_count = 0

def get_producer():
    global producer
    if producer is None:
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=lambda v: json.dumps(
                v,
                separators=(',', ':')
            ).encode("utf-8"),
                acks=0,
                linger_ms=10,
                batch_size=65536,
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

def kafka_sender():
    global sent_count
    prod = get_producer()
    if not prod:
        return
    while True:
        data = msg_queue.get()
        try:
            prod.send(KAFKA_TOPIC, data)
            sent_count += 1
        except Exception as e:
            print(f"Kafka send error: {e}")

sender_thread = threading.Thread(target=kafka_sender, daemon=True)
sender_thread.start()

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT with result code {rc}")
    client.subscribe(MQTT_TOPIC, qos=1)

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
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
        print(f"Stats: {sent_count} msgs sent to Kafka, queue size: {msg_queue.qsize()}")
except KeyboardInterrupt:
    print("Stopping...")
finally:
    client.loop_stop()
    if producer:
        producer.flush()
    client.disconnect()
