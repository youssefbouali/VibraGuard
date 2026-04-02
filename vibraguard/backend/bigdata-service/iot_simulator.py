import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "sensors/vibration"

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")

client = mqtt.Client()
client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

motor_ids = ["MTR-001", "MTR-002", "MTR-003"]

print(f"Starting IoT simulator, publishing to topic '{MQTT_TOPIC}'...")

try:
    while True:
        payload = {
            "motorId": random.choice(motor_ids),
            "time": datetime.now().isoformat(),
            "x": round(random.uniform(0.1, 5.0), 4),
            "y": round(random.uniform(0.1, 5.0), 4),
            "z": round(random.uniform(0.1, 5.0), 4)
        }
        client.publish(MQTT_TOPIC, json.dumps(payload))
        print(f"Published: {payload}")
        time.sleep(2)
except KeyboardInterrupt:
    print("Stopping simulator...")
    client.loop_stop()
    client.disconnect()
