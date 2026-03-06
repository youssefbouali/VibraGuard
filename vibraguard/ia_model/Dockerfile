FROM bitnami/spark:3.4.1

WORKDIR /app

USER root
# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files and scripts
COPY vibraguard_rf_model.joblib .
COPY vibraguard_scaler.joblib .
COPY spark_streaming_process.py .
COPY mqtt_to_kafka.py .

# Environment variables
ENV KAFKA_BROKER="kafka:9092"
ENV MQTT_BROKER="mosquitto"
ENV KAFKA_TOPIC="sensor-data"
ENV MQTT_TOPIC="vibraguard/sensors"

# Default command (can be overridden)
CMD ["spark-submit", "--packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.1", "spark_streaming_process.py"]
