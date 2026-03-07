FROM python:3.10-slim

WORKDIR /app

# Install Java (required for PySpark)
RUN apt-get update && \
    apt-get install -y default-jre procps && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME="/usr/lib/jvm/default-java"

# Install dependencies for training and execution
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files needed for training and execution
COPY train_random_forest.py .
COPY sensor_data_training.csv .
COPY spark_streaming_process.py .
COPY mqtt_to_kafka.py .
COPY mqtt_sensor_simulator.py .

# Run training during build to generate .joblib files
RUN python3 train_random_forest.py

# Environment variables
ENV KAFKA_BROKER="kafka:9092"
ENV MQTT_BROKER="mosquitto"
ENV KAFKA_TOPIC="sensor-data"
ENV MQTT_TOPIC="vibraguard/sensors"

# Create a non-root user and switch appropriately
RUN useradd -m sparkuser
USER sparkuser

# Default command: Runs the Spark streaming job
CMD ["spark-submit", "--packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0", "spark_streaming_process.py"]

