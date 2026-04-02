import paho.mqtt.client as mqtt
from kafka import KafkaProducer
import json

# Setup configurations
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "sensors/vibration"

KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "vibration_data"

# Initialize Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe(MQTT_TOPIC)
    print(f"Subscribed to MQTT topic: {MQTT_TOPIC}")

def on_message(client, userdata, msg):
    payload = msg.payload.decode("utf-8")
    print(f"Received from MQTT: {payload}")
    
    try:
        data = json.loads(payload)
        # Send to Kafka
        producer.send(KAFKA_TOPIC, value=data)
        producer.flush()
        print(f"Sent to Kafka topic '{KAFKA_TOPIC}'")
    except json.JSONDecodeError:
        print("Invalid JSON payload received")
    except Exception as e:
        print(f"Error forwarding message: {e}")

try:
    print("Starting MQTT to Kafka Bridge...")
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    # Blocking call that processes network traffic, dispatches callbacks and handles reconnecting.
    client.loop_forever()
except KeyboardInterrupt:
    print("Stopping bridge...")
    client.disconnect()
    producer.close()
