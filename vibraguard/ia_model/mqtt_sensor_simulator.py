import paho.mqtt.client as mqtt
import json
import time
import random
import numpy as np
import os

# Configuration
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")
MQTT_USER = os.getenv("MQTT_USER", "vibraguard")
MQTT_PASS = os.getenv("MQTT_PASS", "VibraGuard2024!")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(MQTT_USER, MQTT_PASS)

def connect_mqtt():
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        print(f"Connected to MQTT Broker at {MQTT_BROKER}")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return False
    return True

def generate_mock_data():
    """Generates data similar to what the model expects"""
    is_anomaly = random.random() > 0.8
    
    if is_anomaly:
        # Generate anomaly data
        data = {
            "vib_rms": 5.0 + random.uniform(0, 5),
            "vib_peak": 15.0 + random.uniform(0, 10),
            "vib_kurtosis": 4.0 + random.uniform(0, 4),
            "current_rms": 12.0 + random.uniform(0, 5),
            "current_thd": 15.0 + random.uniform(0, 10),
            "temperature": 75.0 + random.uniform(0, 20)
        }
    else:
        # Generate normal data
        data = {
            "vib_rms": 2.5 + random.uniform(-0.5, 0.5),
            "vib_peak": 8.0 + random.uniform(-1, 1),
            "vib_kurtosis": 3.0 + random.uniform(-0.5, 0.5),
            "current_rms": 8.5 + random.uniform(-0.5, 0.5),
            "current_thd": 5.0 + random.uniform(-1, 1),
            "temperature": 55.0 + random.uniform(-5, 5)
        }
    return data

if __name__ == "__main__":
    if connect_mqtt():
        print("Starting sensor simulation. Press Ctrl+C to stop.")
        try:
            while True:
                data = generate_mock_data()
                payload = json.dumps(data)
                client.publish(MQTT_TOPIC, payload)
                print(f"Published: {payload}")
                time.sleep(2)  # Send every 2 seconds
        except KeyboardInterrupt:
            print("Stopped.")
            client.disconnect()
