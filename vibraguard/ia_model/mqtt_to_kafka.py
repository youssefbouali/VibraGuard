import paho.mqtt.client as mqtt
from kafka import KafkaProducer
import json
import os
import threading
import time

MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")

FLUSH_INTERVAL = float(os.getenv("FLUSH_INTERVAL", "0.05"))

producer = None

def get_producer():
    global producer
    if producer is None:
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                acks=1,
                linger_ms=10,
                batch_size=65536,
                compression_type=None,
                max_in_flight_requests_per_connection=5,
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

def flush_loop():
    while True:
        time.sleep(FLUSH_INTERVAL)
        p = producer
        if p:
            try:
                p.flush()
            except Exception as e:
                print(f"Flush error: {e}")

t = threading.Thread(target=flush_loop, daemon=True)
t.start()

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    try:
        data = json.loads(payload)
        prod = get_producer()
        if prod:
            future = prod.send(KAFKA_TOPIC, data)
            future.get(timeout=10)
            prod.flush()
            print(f"Sent to Kafka: {data.get('motor_id', '?')}")
    except Exception as e:
        print(f"Error processing message: {e}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except Exception as e:
    print(f"Failed to connect to MQTT: {e}")
