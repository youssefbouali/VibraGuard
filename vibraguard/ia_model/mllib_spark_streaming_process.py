import os
import sys
import json
import uuid
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
import numpy as np
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, array_max
from pyspark.sql.types import StructType, StructField, DoubleType, StringType
from pyspark.ml import PipelineModel
from pyspark.ml.functions import vector_to_array

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")
MODEL_PATH = os.getenv("MODEL_PATH", "/tmp/vibraguard_rf_pipeline")
BACKEND_URL = os.getenv("BACKEND_URL", "http://api-gateway.vibraguard.svc.cluster.local/api/v1")

print("Loading Spark MLlib pipeline model...")
pipeline_model = PipelineModel.load(MODEL_PATH)

FEATURE_COLUMNS = [
    'vib_rms', 'vib_peak', 'vib_kurtosis',
    'current_rms', 'current_thd', 'temperature'
]

spark = SparkSession.builder \
    .appName("VibraGuardStreamingAI") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
    .config("spark.sql.streaming.schemaInference", "true") \
    .config("spark.sql.shuffle.partitions", "1") \
    .getOrCreate()

ANOMALY_MAP = {0.0: "NONE", 1.0: "IMBALANCE", 2.0: "BEARING_FAULT", 3.0: "MISALIGNMENT"}

def get_anomaly_type(pred):
    return ANOMALY_MAP.get(float(pred), "UNKNOWN")

def write_to_backend(batch_df, epoch_id):
    if batch_df.isEmpty():
        return

    pred_df = pipeline_model.transform(batch_df)
    pred_df = pred_df.withColumn("prob_array", vector_to_array("probability"))
    pred_df = pred_df.withColumn("confidence", array_max("prob_array"))

    pandas_df = pred_df.select(
        "motor_id", "vib_rms", "vib_peak", "vib_kurtosis",
        "current_rms", "current_thd", "temperature", "power", "speed",
        "prediction", "confidence"
    ).toPandas()

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

        prediction_val = float(row['prediction'])
        anomaly_type_val = get_anomaly_type(prediction_val)
        confidence_val = float(row['confidence']) * 100

        is_anomaly = prediction_val != 0.0

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
            "power": row.get("power") if isinstance(row.get("power"), str) else "450 kW",
            "speed": row.get("speed") if isinstance(row.get("speed"), str) else "1480 RPM"
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

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_row, row) for _, row in pandas_df.iterrows()]
        for f in as_completed(futures):
            try:
                f.result()
            except Exception as e:
                print(f"Row processing error (continuing batch): {e}")

    total_records = len(pandas_df)
    anomalies_count = pandas_df['prediction'].astype(float).ne(0.0).sum()
    uptime_val = max(0.0, 100.0 - (float(anomalies_count) / total_records * 100.0)) if total_records > 0 else 100.0

    kpis = [
        {"id": "uptime", "numericValue": uptime_val, "trend": f"-{anomalies_count} alertes", "trendUp": False},
        {"id": "alertsTrend", "stringValue": f"{anomalies_count} IA", "trend": f"+{anomalies_count} via IA", "trendUp": False}
    ]
    for kpi in kpis:
        call_api("bi/kpis/upsert", data=kpi)

    print(f"Batch {epoch_id} processed ({total_records} records).")

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

print(f"Starting stream from Kafka: {KAFKA_BROKER} topic {KAFKA_TOPIC}")
df_kafka = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", KAFKA_BROKER) \
    .option("subscribe", KAFKA_TOPIC) \
    .load()

df_parsed = df_kafka.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*")

query = df_parsed.writeStream \
    .foreachBatch(write_to_backend) \
    .outputMode("append") \
    .trigger(processingTime='1 second') \
    .option("checkpointLocation", "/tmp/spark-checkpoints") \
    .start()

try:
    query.awaitTermination()
except KeyboardInterrupt:
    print("Streaming stopped by user")
finally:
    spark.stop()
