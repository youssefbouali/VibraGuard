import paho.mqtt.client as mqtt
import json
import time
import random
import uuid
import os

# ==========================================
# CONFIGURATION
# ==========================================
MQTT_BROKER = os.getenv("MQTT_BROKER", "vibraguard.mywire.org")  # Fallback to mywire
MQTT_PORT = int(os.getenv("MQTT_PORT", 30083))        # Default MQTT port for external access
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "vibraguard/sensors")
CLIENT_ID = f"vibraguard_external_simulator_{uuid.uuid4()}" # Unique client ID
MOTOR_ID = os.getenv("MOTOR_ID", "MTR-Broyeur-04") # Specify the motor ID here

# Optional: Add Username and Password if your broker requires authentication
MQTT_USER = None   # e.g., "my_username"
MQTT_PASS = None   # e.g., "my_password"


# ==========================================
# DATA GENERATION
# ==========================================
def generate_sensor_data():
    """Generates synthetic sensor data aligned with training CSV types."""
    is_anomaly = random.random() < 1
    
    if is_anomaly:
        scenario = random.choice(["ROULEMENT", "DESEQUILIBRE", "DESALIGNEMENT", "SURCHAUFFE", "ELECTRIQUE"])
        
        if scenario == "ROULEMENT":
            # DEFAUT_ROULEMENT: High Kurtosis and Peak
            data = {
                "motor_id": MOTOR_ID,
                "rpm": random.uniform(1460, 1485),
                "vib_rms": random.uniform(3.5, 5.0),
                "vib_peak": random.uniform(20.0, 30.0),
                "vib_kurtosis": random.uniform(7.0, 12.0),
                "current_rms": random.uniform(8.5, 9.5),
                "current_thd": random.uniform(4.0, 6.0),
                "temperature": random.uniform(55.0, 65.0),
                "status": "anomalous"
            }
        elif scenario == "DESEQUILIBRE":
            # DESEQUILIBRE: Very High RMS, moderate Peak
            data = {
                "motor_id": MOTOR_ID,
                "rpm": random.uniform(1350, 1420),
                "vib_rms": random.uniform(9.0, 14.0),
                "vib_peak": random.uniform(14.0, 18.0),
                "vib_kurtosis": random.uniform(2.8, 3.2),
                "current_rms": random.uniform(9.5, 11.0),
                "current_thd": random.uniform(5.0, 8.0),
                "temperature": random.uniform(60.0, 75.0),
                "status": "anomalous"
            }
        elif scenario == "DESALIGNEMENT":
            # DESALIGNEMENT: Moderate RMS and Peak, some temperature rise
            data = {
                "motor_id": MOTOR_ID,
                "rpm": random.uniform(1440, 1470),
                "vib_rms": random.uniform(5.0, 8.0),
                "vib_peak": random.uniform(10.0, 15.0),
                "vib_kurtosis": random.uniform(3.0, 4.5),
                "current_rms": random.uniform(9.0, 10.5),
                "current_thd": random.uniform(6.0, 9.0),
                "temperature": random.uniform(70.0, 80.0),
                "status": "anomalous"
            }
        elif scenario == "SURCHAUFFE":
            # SURCHAUFFE: Extreme Temperature
            data = {
                "motor_id": MOTOR_ID,
                "rpm": random.uniform(1470, 1490),
                "vib_rms": random.uniform(3.0, 4.5),
                "vib_peak": random.uniform(8.0, 12.0),
                "vib_kurtosis": random.uniform(2.5, 3.5),
                "current_rms": random.uniform(11.0, 13.0),
                "current_thd": random.uniform(7.0, 10.0),
                "temperature": random.uniform(95.0, 115.0),
                "status": "anomalous"
            }
        else: # ELECTRIQUE
            # SURCHARGE_ELECTRIQUE: High Current and THD
            data = {
                "motor_id": MOTOR_ID,
                "rpm": random.uniform(1450, 1480),
                "vib_rms": random.uniform(2.5, 4.0),
                "vib_peak": random.uniform(7.0, 10.0),
                "vib_kurtosis": random.uniform(2.5, 3.5),
                "current_rms": random.uniform(15.0, 22.0),
                "current_thd": random.uniform(18.0, 30.0),
                "temperature": random.uniform(75.0, 85.0),
                "status": "anomalous"
            }
    else:
        # NORMAL / NONE
        data = {
            "motor_id": MOTOR_ID,
            "rpm": random.uniform(1450, 1490),
            "vib_rms": random.uniform(2.0, 3.0),
            "vib_peak": random.uniform(7.0, 9.0),
            "vib_kurtosis": random.uniform(2.5, 3.5),
            "current_rms": random.uniform(8.0, 9.0),
            "current_thd": random.uniform(4.0, 6.0),
            "temperature": random.uniform(50.0, 60.0),
            "status": "normal"
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
            status_indicator = "🔴" if sensor_data["temperature"] > 70.0 else "🟢"
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
