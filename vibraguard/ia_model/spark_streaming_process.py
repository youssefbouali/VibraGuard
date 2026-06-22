import os
import sys
import json
import uuid
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import joblib
import pandas as pd
import numpy as np
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, from_json, struct
from pyspark.sql.types import StructType, StructField, DoubleType, StringType

# Configuration
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")
MODEL_PATH = "vibraguard_rf_model.joblib"
SCALER_PATH = "vibraguard_scaler.joblib"
BACKEND_URL = os.getenv("BACKEND_URL", "http://api-gateway.vibraguard.svc.cluster.local/api/v1")

# Load Model and Scaler
print("Loading model and scaler...")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURE_COLUMNS = [
    'vib_rms', 'vib_peak', 'vib_kurtosis', 
    'current_rms', 'current_thd', 'temperature'
]

# Define the UDF for prediction with confidence
@udf(returnType=StringType())
def predict_anomaly(*features):
    try:
        features_array = np.array(features).reshape(1, -1)
        scaled_features = scaler.transform(features_array)
        
        prediction_type = str(model.predict(scaled_features)[0])
        probas = model.predict_proba(scaled_features)[0]
        confidence = float(np.max(probas))
        
        label = "0" if prediction_type == "NONE" else "1"
        return f"{label},{prediction_type},{confidence * 100:.2f}"
    except Exception as e:
        return f"Error,{str(e)}"

# Create Spark Session
spark = SparkSession.builder \
    .appName("VibraGuardStreamingAI") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
    .config("spark.sql.streaming.schemaInference", "true") \
    .config("spark.sql.shuffle.partitions", "1") \
    .getOrCreate()

def write_to_backend(batch_df, epoch_id):
    if batch_df.isEmpty():
        return

    pandas_df = batch_df.toPandas()
    print(f"Batch {epoch_id}: Sending {len(pandas_df)} records to Backend API at {BACKEND_URL}")

    def call_api(endpoint, method="POST", data=None):
        url = f"{BACKEND_URL}/{endpoint}"
        try:
            req = urllib.request.Request(url, method=method)
            req.add_header('Content-Type', 'application/json')
            payload = json.dumps(data).encode('utf-8') if data else None
            with urllib.request.urlopen(req, data=payload, timeout=5) as response:
                return response.read()
        except Exception as e:
            print(f"API Error on {url}: {e}")
            return None

    def process_row(row):
        motor = str(row['motor_id'])
        v_rms = float(row['vib_rms'])
        v_peak = float(row['vib_peak'])
        v_kurt = float(row['vib_kurtosis'])
        temp = float(row['temperature'])

        raw_pred = str(row['prediction'])
        parts = raw_pred.split(',')
        prediction_val = parts[0]
        anomaly_type_val = parts[1] if len(parts) > 1 else "NONE"
        confidence_val = float(parts[2]) if len(parts) > 2 and parts[2].replace('.','',1).isdigit() else 94.5

        is_anomaly = prediction_val.strip().upper() in ['1', '1.0', 'TRUE', 'ANOMALOUS', 'ANOMALY']

        vib_payload = {
            "motorId": motor,
            "vibRms": v_rms,
            "vibPeak": v_peak,
            "vibKurtosis": v_kurt,
            "temperature": temp,
            "currentRms": float(row['current_rms']),
            "anomalous": is_anomaly
        }
        call_api("iot/motors/vibrations", data=vib_payload)

        health_score = max(5.0, min(95.0, 100.0 - (v_rms * 7.5)))
        if is_anomaly:
            if health_score > 60.0: health_score = 55.0
            label, color = "Critique", "EF4444"
        elif health_score < 30.0:
            label, color = "Critique", "EF4444"
        elif health_score < 70.0:
            label, color = "Alerte", "F59E0B"
        else:
            label, color = "Normal", "10B981"

        motor_update = {
            "etatPct": int(health_score),
            "etatLabel": f"{int(health_score)}% {label}",
            "etatColor": f"#{color}",
            "derniereAlerteType": anomaly_type_val if is_anomaly else "Sain",
            "vibration": f"{v_rms:.2f}",
            "power": row.power if hasattr(row, 'power') and row.power else "450 kW",
            "speed": row.speed if hasattr(row, 'speed') and row.speed else "1480 RPM"
        }
        call_api(f"iot/motors/{motor}", method="PUT", data=motor_update)

        if is_anomaly and confidence_val >= 51:
            alert_payload = {
                "message": f"Anomalie IA detectee sur {motor} (Vib: {v_rms:.2f})",
                "level": "Critique",
                "color": "#EF4444",
                "priority": "high",
                "status": "Nouveau",
                "velociteRms": v_rms,
                "accelerationPeak": v_peak,
                "temperature": temp,
                "scoreConfianceIA": confidence_val,
                "depassementSeuil": v_rms * 0.15,
                "anomalyType": anomaly_type_val
            }
            call_api("ml/alerts", data=alert_payload)
            # call_api("iot/inventory-parts/decrement/PART-02")  # ملغى - محاكاة استهلاك قطعة غيار

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_row, row) for _, row in pandas_df.iterrows()]
        for f in as_completed(futures):
            try:
                f.result()
            except Exception as e:
                print(f"Row processing error (continuing batch): {e}")

    total_records = len(pandas_df)
    anomalies_count = pandas_df['prediction'].astype(str).str.contains('1|anomalous|True', case=False, na=False).sum()
    uptime_val = max(0.0, 100.0 - (float(anomalies_count) / total_records * 100.0)) if total_records > 0 else 100.0

    kpis = [
        {"id": "uptime", "numericValue": uptime_val, "trend": f"-{anomalies_count} alertes", "trendUp": False},
        {"id": "alertsTrend", "stringValue": f"{anomalies_count} IA", "trend": f"+{anomalies_count} via IA", "trendUp": False}
    ]
    for kpi in kpis:
        call_api("bi/kpis/upsert", data=kpi)

    print(f"Batch {epoch_id} processed ({total_records} records).")

# Suppress verbose INFO logs, keep only WARNING and ERROR messages 
# so the ASCII table predictions are easily visible.
#spark.sparkContext.setLogLevel("WARN")

# Schema for incoming JSON data
schema = StructType([
    StructField("motor_id", StringType(), True),
    StructField("vib_rms", DoubleType()),
    StructField("vib_peak", DoubleType()),
    StructField("vib_kurtosis", DoubleType()),
    StructField("current_rms", DoubleType()),
    StructField("current_thd", DoubleType()),
    StructField("temperature", DoubleType()),
    StructField("power", StringType(), True),
    StructField("speed", StringType(), True)
])

# Read from Kafka
print(f"Starting stream from Kafka: {KAFKA_BROKER} topic {KAFKA_TOPIC}")
df_kafka = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", KAFKA_BROKER) \
    .option("subscribe", KAFKA_TOPIC) \
    .load()

# Parse JSON
df_parsed = df_kafka.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*")

# Apply Prediction UDF
# We pass each feature column to the UDF
df_with_predictions = df_parsed.withColumn(
    "prediction", 
    predict_anomaly(*[col(c) for c in FEATURE_COLUMNS])
)

# Output predictions to Backend API via foreachBatch
query = df_with_predictions.writeStream \
    .foreachBatch(write_to_backend) \
    .outputMode("append") \
    .trigger(processingTime='2 seconds') \
    .option("checkpointLocation", "/tmp/spark-checkpoints") \
    .start()

try:
    query.awaitTermination()
except KeyboardInterrupt:
    print("Streaming stopped by user")
finally:
    spark.stop()
