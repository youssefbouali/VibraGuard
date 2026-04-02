# VibraGuard Big Data Service Pipeline (MQTT -> Kafka -> Spark -> Oracle)

This module handles the real-time processing of IoT vibration data, bridging it through MQTT, Kafka, processing it with Spark Structured Streaming, and saving it into an Oracle database.

## Prerequisites

- **Python 3.9+**
- **Docker** (to easily run Mosquitto and Kafka if not already running)
- **Spark 3.4.1+** (if installed locally, otherwise the python `pyspark` package works)
- You must download the **Oracle JDBC Driver (`ojdbc8.jar`)** and place it in this folder for PySpark to write data to Oracle.

## Setup Instructions

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Make sure your services are running:
   - **MQTT Broker** (e.g., Mosquitto on `localhost:1883`)
   - **Kafka** (on `localhost:9092`)
   - **Oracle DB** (on `localhost:1521` or pointing to your cluster URL inside `spark_processor.py`)

3. Update the Connection URLs:
   Change `ORACLE_URL`, `KAFKA_BOOTSTRAP_SERVERS`, and `MQTT_BROKER` inside the `.py` files according to your environments if needed.

## Running the Pipeline

You need to run 3 distinct processes in separate terminal windows:

### 1. Start the Spark Processor (Kafka to Oracle)
Wait until it says it's listening to the Kafka topic.
```bash
spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.1 --jars ojdbc8.jar spark_processor.py
# If running through plain python (ensure java is installed):
# python spark_processor.py
```

### 2. Start the MQTT to Kafka Bridge
```bash
python mqtt_kafka_bridge.py
```

### 3. Start the IoT MQTT Simulator
Generates mock vibration data.
```bash
python iot_simulator.py
```

### Flow description:
1. `iot_simulator.py` generates realistic vibration data (X,Y,Z) and publishes it via MQTT (`sensors/vibration`).
2. `mqtt_kafka_bridge.py` consumes this MQTT topic and publishes each record to a Kafka topic (`vibration_data`).
3. `spark_processor.py` (PySpark Structured Streaming job) listens to `vibration_data` from Kafka, transforms it, and uses JDBC to APPEND it to the `VIBRATION_DATA` Oracle table.
