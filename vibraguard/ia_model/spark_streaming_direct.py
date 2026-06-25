import os
import sys
import json
import uuid
from datetime import datetime, timezone
import joblib
import pandas as pd
import numpy as np
import oracledb
from kafka import KafkaProducer
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, from_json, struct, lit, when, current_timestamp
from pyspark.sql.types import StructType, StructField, DoubleType, StringType, BooleanType

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")
WS_EVENT_TOPIC = os.getenv("WS_EVENT_TOPIC", "vibration-events")
MODEL_PATH = "vibraguard_rf_model.joblib"
SCALER_PATH = "vibraguard_scaler.joblib"

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb.vibraguard.svc.cluster.local:27017/vibraguard")

ORACLE_URL = os.getenv("ORACLE_URL", "jdbc:oracle:thin:@oracle-db.vibraguard.svc.cluster.local:1521:xe")
ORACLE_USER = os.getenv("ORACLE_USER", "system")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "password")
ORACLE_DRIVER = "oracle.jdbc.OracleDriver"
ORACLE_DSN = os.getenv("ORACLE_DSN", "oracle-db.vibraguard.svc.cluster.local:1521/xe")

print("Loading model and scaler...")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURE_COLUMNS = [
    'vib_rms', 'vib_peak', 'vib_kurtosis',
    'current_rms', 'current_thd', 'temperature'
]

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

spark = SparkSession.builder \
    .appName("VibraGuardDirectDB") \
    .config("spark.jars.packages",
            "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,"
            "org.mongodb.spark:mongo-spark-connector_2.12:10.4.0,"
            "com.oracle.database.jdbc:ojdbc8:21.1.0.0") \
    .config("spark.sql.streaming.schemaInference", "true") \
    .config("spark.sql.shuffle.partitions", "1") \
    .getOrCreate()

oracle_pool = oracledb.create_pool(
    user=ORACLE_USER,
    password=ORACLE_PASSWORD,
    dsn=ORACLE_DSN,
    min=1,
    max=5
)

ws_producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

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

def write_motors_to_oracle(pandas_df):
    conn = oracle_pool.acquire()
    cursor = conn.cursor()
    try:
        merge_sql = """
            MERGE INTO MOTORS t
            USING (SELECT :id AS id FROM DUAL) s
            ON (t.ID = s.id)
            WHEN MATCHED THEN UPDATE SET
                ETAT_PCT = :etat_pct,
                ETAT_LABEL = :etat_label,
                ETAT_COLOR = :etat_color,
                DERNIERE_ALERTE_TYPE = :derniere_alerte_type,
                VIBRATION = :vibration,
                POWER = :power,
                SPEED = :speed
            WHEN NOT MATCHED THEN INSERT
                (ID, ETAT_PCT, ETAT_LABEL, ETAT_COLOR, DERNIERE_ALERTE_TYPE, VIBRATION, POWER, SPEED)
            VALUES
                (:id, :etat_pct, :etat_label, :etat_color, :derniere_alerte_type, :vibration, :power, :speed)
        """
        rows = []
        for _, row in pandas_df.iterrows():
            parts = str(row['prediction']).split(',')
            is_anomaly = parts[0].strip() in ['1', '1.0', 'TRUE']
            anomaly_type = parts[1] if len(parts) > 1 else "NONE"

            v_rms = float(row['vib_rms'])
            health_score = max(5.0, min(95.0, 100.0 - (v_rms * 7.5)))
            if is_anomaly and health_score > 60.0:
                health_score = 55.0

            if is_anomaly:
                label, color = "Critique", "#EF4444"
            elif health_score < 30.0:
                label, color = "Critique", "#EF4444"
            elif health_score < 70.0:
                label, color = "Alerte", "#F59E0B"
            else:
                label, color = "Normal", "#10B981"

            rows.append({
                "id": str(row['motor_id']),
                "etat_pct": int(health_score),
                "etat_label": f"{int(health_score)}% {label}",
                "etat_color": color,
                "derniere_alerte_type": anomaly_type if is_anomaly else "Sain",
                "vibration": f"{v_rms:.2f}",
                "power": str(row.get('power', '450 kW')),
                "speed": str(row.get('speed', '1480 RPM'))
            })
        cursor.executemany(merge_sql, rows)
        conn.commit()
    except Exception as e:
        print(f"Oracle motor MERGE error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def write_kpis_to_oracle(pandas_df):
    conn = oracle_pool.acquire()
    cursor = conn.cursor()
    try:
        total_records = len(pandas_df)
        anomalies_count = pandas_df['prediction'].astype(str).str.contains('1|anomalous|True', case=False, na=False).sum()
        uptime_val = max(0.0, 100.0 - (float(anomalies_count) / total_records * 100.0)) if total_records > 0 else 100.0

        kpis = [
            {"id": "uptime", "numeric_value": uptime_val, "string_value": None, "trend": f"-{anomalies_count} alertes", "trend_up": False},
            {"id": "alertsTrend", "numeric_value": None, "string_value": f"{anomalies_count} IA", "trend": f"+{anomalies_count} via IA", "trend_up": False}
        ]
        merge_sql = """
            MERGE INTO KPI_VALUES t
            USING (SELECT :id AS id FROM DUAL) s
            ON (t.ID = s.id)
            WHEN MATCHED THEN UPDATE SET
                NUMERIC_VALUE = :numeric_value,
                STRING_VALUE = :string_value,
                TREND = :trend,
                TREND_UP = :trend_up
            WHEN NOT MATCHED THEN INSERT
                (ID, NUMERIC_VALUE, STRING_VALUE, TREND, TREND_UP)
            VALUES
                (:id, :numeric_value, :string_value, :trend, :trend_up)
        """
        cursor.executemany(merge_sql, kpis)
        conn.commit()
    except Exception as e:
        print(f"Oracle KPI MERGE error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def write_to_databases(batch_df, epoch_id):
    if batch_df.isEmpty():
        return

    pandas_df = batch_df.toPandas()
    print(f"Batch {epoch_id}: Processing {len(pandas_df)} records")

    mongo_df = batch_df.select(
        col("motor_id"),
        current_timestamp().alias("vibration_time"),
        col("vib_rms").alias("vibRms"),
        col("vib_peak").alias("vibPeak"),
        col("vib_kurtosis").alias("vibKurtosis"),
        col("temperature"),
        col("current_rms").alias("currentRms"),
        when(col("prediction").startswith("1"), lit(True)).otherwise(lit(False)).alias("isAnomalous")
    )
    mongo_df.write \
        .format("mongodb") \
        .mode("append") \
        .option("connection.uri", MONGO_URI) \
        .option("database", "vibraguard") \
        .option("collection", "vibration_data") \
        .save()

    for _, row in pandas_df.iterrows():
        parts = str(row['prediction']).split(',')
        is_anomaly = parts[0].strip() in ['1', '1.0', 'TRUE']
        event = {
            "motorId": row['motor_id'],
            "time": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "vibRms": row['vib_rms'],
            "vibPeak": row['vib_peak'],
            "vibKurtosis": row['vib_kurtosis'],
            "temperature": row['temperature'],
            "currentRms": row['current_rms'],
            "anomalous": is_anomaly
        }
        ws_producer.send(WS_EVENT_TOPIC, value=event)
    ws_producer.flush()

    alerts_condition = col("prediction").startswith("1")
    alerts_df = batch_df.filter(alerts_condition)
    if not alerts_df.isEmpty():
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        alerts_oracle = alerts_df.select(
            lit(str(uuid.uuid4())).alias("id"),
            col("motor_id").alias("motorId"),
            col("vib_rms").alias("vibRms"),
            col("vib_peak").alias("vibPeak"),
            col("temperature"),
            col("prediction")
        )
        pandas_alerts = alerts_oracle.toPandas()
        conn = oracle_pool.acquire()
        cursor = conn.cursor()
        try:
            alert_rows = []
            for _, row in pandas_alerts.iterrows():
                parts = str(row['prediction']).split(',')
                confidence_val = float(parts[2]) if len(parts) > 2 and parts[2].replace('.', '', 1).isdigit() else 94.5
                if confidence_val < 51:
                    continue
                v_rms = float(row['vibRms'])
                alert_rows.append((
                    str(uuid.uuid4()),
                    f"Anomalie IA detectee sur {row['motorId']} (Vib: {v_rms:.2f})",
                    "Critique",
                    now_str,
                    "#EF4444",
                    "high",
                    "Nouveau",
                    str(row['motorId']),
                    v_rms,
                    float(row['vibPeak']),
                    float(row['temperature']),
                    confidence_val,
                    v_rms * 0.15,
                    parts[1] if len(parts) > 1 else "NONE"
                ))
            if alert_rows:
                cursor.executemany("""
                    INSERT INTO ALERTS
                        (ID, MESSAGE, ALERT_LEVEL, ALERT_TIME, COLOR, PRIORITY, STATUS,
                         MOTOR_ID, VELOCITE_RMS, ACCELERATION_PEAK, TEMPERATURE,
                         SCORE_CONFIANCE_IA, DEPASSEMENT_SEUIL, ANOMALY_TYPE)
                    VALUES
                        (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14)
                """, alert_rows)
                conn.commit()
        except Exception as e:
            print(f"Oracle alerts INSERT error: {e}")
            conn.rollback()
        finally:
            cursor.close()
            conn.close()

    write_motors_to_oracle(pandas_df)
    write_kpis_to_oracle(pandas_df)
    print(f"Batch {epoch_id} completed ({len(pandas_df)} records)")

spark.sparkContext.setLogLevel("WARN")

print(f"Starting direct stream from Kafka: {KAFKA_BROKER} topic {KAFKA_TOPIC}")
df_kafka = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", KAFKA_BROKER) \
    .option("subscribe", KAFKA_TOPIC) \
    .option("startingOffsets", "earliest") \
    .load()

df_parsed = df_kafka.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*")

df_with_predictions = df_parsed.withColumn(
    "prediction",
    predict_anomaly(*[col(c) for c in FEATURE_COLUMNS])
)

query = df_with_predictions.writeStream \
    .foreachBatch(write_to_databases) \
    .outputMode("append") \
    .trigger(processingTime='1 second') \
    .option("checkpointLocation", "/tmp/spark-checkpoints-direct-2") \
    .start()

try:
    query.awaitTermination()
except KeyboardInterrupt:
    print("Streaming stopped by user")
finally:
    oracle_pool.close()
    spark.stop()
