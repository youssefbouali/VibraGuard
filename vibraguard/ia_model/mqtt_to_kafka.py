import paho.mqtt.client as mqtt
from kafka import KafkaProducer
import json
import os

# Configuration
MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")

print(f"Connecting to MQTT Broker: {MQTT_BROKER}:{MQTT_PORT}")
print(f"Forwarding to Kafka: {KAFKA_BROKER} topic {KAFKA_TOPIC}")

# Kafka Producer
producer = None
try:
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
except Exception as e:
    print(f"Error creating Kafka producer: {e}")

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"Received message on {msg.topic}: {payload}")
    
    try:
        data = json.loads(payload)
        if producer:
            producer.send(KAFKA_TOPIC, data)
            print(f"Sent to Kafka: {data}")
    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT Client
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except Exception as e:
    print(f"Failed to connect to MQTT: {e}")
