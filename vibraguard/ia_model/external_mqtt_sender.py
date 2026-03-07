import paho.mqtt.client as mqtt
import json
import time
import random
import uuid

# ==========================================
# CONFIGURATION
# ==========================================
MQTT_BROKER = "vibraguard.mywire.org"  # The target domain
MQTT_PORT = 30083                      # The Kubernetes NodePort we just opened
MQTT_TOPIC = "vibraguard/sensors"      # Topic to publish data to
CLIENT_ID = f"vibraguard_external_simulator_{uuid.uuid4()}" # Unique client ID

# Optional: Add Username and Password if your broker requires authentication
MQTT_USER = None   # e.g., "my_username"
MQTT_PASS = None   # e.g., "my_password"

# ==========================================
# DATA GENERATION
# ==========================================
def generate_sensor_data():
    """Generates synthetic sensor data."""
    is_anomaly = random.random() < 0.2  # 20% chance to generate an anomaly
    
    if is_anomaly:
        data = {
            "rpm": random.uniform(1300, 1500),
            "vib_rms": random.uniform(5.0, 10.0),
            "vib_peak": random.uniform(15.0, 25.0),
            "vib_kurtosis": random.uniform(4.0, 8.0),
            "fft_dominant_freq": random.uniform(19.5, 29.5),
            "fft_max_amplitude": random.uniform(10.0, 20.0),
            "fft_total_power": random.uniform(500.0, 1000.0),
            "current_rms": random.uniform(12.0, 17.0),
            "current_thd": random.uniform(15.0, 25.0),
            "temperature": random.uniform(75.0, 95.0),
            "status": "anomalous" # just for debugging
        }
    else:
        data = {
            "rpm": random.uniform(1450, 1490),
            "vib_rms": random.uniform(2.0, 3.0),
            "vib_peak": random.uniform(7.0, 9.0),
            "vib_kurtosis": random.uniform(2.5, 3.5),
            "fft_dominant_freq": random.uniform(23.5, 25.5),
            "fft_max_amplitude": random.uniform(3.0, 5.0),
            "fft_total_power": random.uniform(150.0, 250.0),
            "current_rms": random.uniform(8.0, 9.0),
            "current_thd": random.uniform(4.0, 6.0),
            "temperature": random.uniform(50.0, 60.0),
            "status": "normal" # just for debugging
        }
    return data

# ==========================================
# MQTT CALLBACKS
# ==========================================
def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"✅ Successfully connected to external MQTT Broker at {MQTT_BROKER}")
    else:
        print(f"❌ Failed to connect, return code {reason_code}")

def on_publish(client, userdata, mid, reason_code, properties):
    pass # Optional: can be used to track successful message deliveries

# ==========================================
# MAIN LOOP
# ==========================================
def main():
    print(f"Initializing MQTT Client (Target: {MQTT_BROKER}:{MQTT_PORT})...")
    
    # Initialize client using MQTTv5 to ensure compatibility
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID)
    
    # Set Callbacks
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    # Set Credentials if provided
    if MQTT_USER and MQTT_PASS:
        client.username_pw_set(MQTT_USER, MQTT_PASS)

    try:
        # Connect to the remote broker
        print("Connecting...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print(f"Note: Ensure that port {MQTT_PORT} is open on the router/firewall for {MQTT_BROKER}")
        return

    # Start the network loop in a background thread
    client.loop_start()

    print(f"Starting data transmission to topic '{MQTT_TOPIC}'. Press Ctrl+C to stop.")
    
    try:
        while True:
            # 1. Generate data
            sensor_data = generate_sensor_data()
            payload = json.dumps(sensor_data)
            
            # 2. Publish to the remote domain
            result = client.publish(MQTT_TOPIC, payload, qos=0)
            
            # 3. Log to console
            status_indicator = "🔴" if sensor_data["status"] == "anomalous" else "🟢"
            print(f"[{status_indicator}] Sent to {MQTT_BROKER} -> {payload}")
            
            # 4. Wait before sending the next one
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nStopping data transmission...")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Disconnected gracefully.")

if __name__ == "__main__":
    main()
