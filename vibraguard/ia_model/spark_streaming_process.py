import os
import sys

# FORCE Spark to load Oracle JDBC via direct URL and Kafka via packages
# This is more reliable than coordinate-based loading in some containers
os.environ['PYSPARK_SUBMIT_ARGS'] = '--jars https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc11/21.1.0.0/ojdbc11-21.1.0.0.jar --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0 pyspark-shell'

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, from_json, struct
from pyspark.sql.types import StructType, StructField, DoubleType, StringType
import joblib
import pandas as pd
import numpy as np
import json
import uuid

# Configuration
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")
MODEL_PATH = "vibraguard_rf_model.joblib"
SCALER_PATH = "vibraguard_scaler.joblib"

ORACLE_URL = os.getenv("ORACLE_URL", "jdbc:oracle:thin:@oracle-db:1521:xe")
ORACLE_USER = os.getenv("ORACLE_USER", "system")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "password")
ORACLE_DRIVER = "oracle.jdbc.driver.OracleDriver"
ORACLE_TABLE = os.getenv("ORACLE_TABLE", "AI_SENSOR_PREDICTIONS")

# Load Model and Scaler at the driver level (ideally broadcast them)
print("Loading model and scaler...")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Define columns as in the training script
FEATURE_COLUMNS = [
    'rpm', 'vib_rms', 'vib_peak', 'vib_kurtosis', 
    'fft_dominant_freq', 'fft_max_amplitude', 'fft_total_power', 
    'current_rms', 'current_thd', 'temperature'
]

# Define the UDF for prediction
@udf(returnType=StringType())
def predict_anomaly(*features):
    try:
        # Convert features to numpy array and reshape for single prediction
        features_array = np.array(features).reshape(1, -1)
        # Scale features
        scaled_features = scaler.transform(features_array)
        # Predict
        prediction = model.predict(scaled_features)[0]
        return str(prediction)
    except Exception as e:
        return f"Error: {str(e)}"


# Create Spark Session with explicit jar config and direct Oracle JAR fallback
spark = SparkSession.builder \
    .appName("VibraGuardStreamingAI") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
    .config("spark.jars", "https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc11/21.1.0.0/ojdbc11-21.1.0.0.jar") \
    .getOrCreate()

def write_to_oracle(batch_df, epoch_id):
    if batch_df.isEmpty():
        return
        
    pandas_df = batch_df.toPandas()
    
    # Load Oracle driver using Thread context classloader (Spark's MutableURLClassLoader)
    # Class.forName() via Py4J uses the system AppClassLoader which doesn't see Spark-added JARs.
    # We must use the thread classloader where Spark actually placed ojdbc11.jar.
    print(f"Connecting to Oracle at: {ORACLE_URL} (User: {ORACLE_USER})")
    try:
        jvm = spark._jvm
        thread_cl = jvm.java.lang.Thread.currentThread().getContextClassLoader()
        try:
            driver_class = thread_cl.loadClass("oracle.jdbc.OracleDriver")
        except:
            driver_class = thread_cl.loadClass("oracle.jdbc.driver.OracleDriver")
        driver_instance = driver_class.getDeclaredConstructor().newInstance()
        jvm.java.sql.DriverManager.registerDriver(driver_instance)
        print("Oracle JDBC Driver registered successfully via thread classloader.")
    except Exception as e:
        print(f"CRITICAL: Oracle JDBC Driver not found in thread classloader! {str(e)}")
        return

    # Establish Oracle JDBC Connection via Py4J
    conn = spark._jvm.java.sql.DriverManager.getConnection(ORACLE_URL, ORACLE_USER, ORACLE_PASSWORD)
    try:
        stmt = conn.createStatement()
        
        for index, row in pandas_df.iterrows():
            motor = str(row['motor_id'])
            v_rms = float(row['vib_rms'])
            v_peak = float(row['vib_peak'])
            v_kurt = float(row['vib_kurtosis'])
            temp = float(row['temperature'])
            
            # 1. Insert Vibration Data
            sql_vib = f"""
                INSERT INTO VIBRATION_DATA (MOTOR_ID, VIBRATION_TIME, x, y, z) 
                VALUES ('{motor}', TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS'), {v_rms}, {v_peak}, {v_kurt})
            """
            try: stmt.executeUpdate(sql_vib)
            except Exception as e: print("Error VIBRATION:", e)
            
            # Check for prediction anomaly
            is_anomaly = str(row['prediction']) in ['1', '1.0', 'True', 'anomalous']
            if is_anomaly:
                # 2. Insert Alert
                alert_id = "ALR-" + str(uuid.uuid4())[:8]
                msg = f"Anomalie IA dectectee sur {motor}"
                sql_alert = f"""
                    INSERT INTO ALERTS (id, message, ALERT_LEVEL, ALERT_TIME, color, priority, status, velocite_rms, acceleration_peak, temperature, score_confiance_ia, depassement_seuil)
                    VALUES ('{alert_id}', '{msg}', 'Critique', TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS'), '#EF4444', 'high', 'Nouveau', {v_rms}, {v_peak}, {temp}, 94.5, {v_rms * 0.15})
                """
                try: stmt.executeUpdate(sql_alert)
                except Exception as e: print("Error ALERT:", e)
                
                # 3. Decrease Inventory (Simulate usage)
                sql_inv = """
                    UPDATE INVENTORY_PART 
                    SET stock = CASE WHEN stock > 0 THEN stock - 1 ELSE 0 END,
                        status = CASE WHEN stock - 1 <= 0 THEN 'red' ELSE status END
                    WHERE id = 'PART-02'
                """
                try: stmt.executeUpdate(sql_inv)
                except Exception as e: print("Error INVENTORY:", e)
                
        # 4. Calculate and Upsert KPIs
        total_records = len(pandas_df)
        anomalies_count = pandas_df['prediction'].astype(str).str.contains('1|anomalous|True', case=False, na=False).sum()
        uptime_val = max(0.0, 100.0 - (float(anomalies_count) / total_records * 100.0)) if total_records > 0 else 100.0
        
        kpis = [
            ("uptime", uptime_val, "NULL", f"'-{anomalies_count} alertes'", "0"),
            ("alertsTrend", "NULL", f"'{anomalies_count} IA'", f"'+{anomalies_count} via IA'", "0")
        ]
        
        for k_id, num_val, str_val, trend, t_up in kpis:
            sql_kpi = f"""
                MERGE INTO KPI_VALUES k
                USING (SELECT '{k_id}' as id, {num_val} as numVal, {str_val} as strVal, {trend} as tr, {t_up} as tUp FROM DUAL) src
                ON (k.id = src.id)
                WHEN MATCHED THEN UPDATE SET k.numeric_value = src.numVal, k.string_value = src.strVal, k.trend = src.tr, k.trend_up = src.tUp
                WHEN NOT MATCHED THEN INSERT (id, numeric_value, string_value, trend, trend_up) VALUES (src.id, src.numVal, src.strVal, src.tr, src.tUp)
            """
            try: stmt.executeUpdate(sql_kpi)
            except Exception as e: print("Error MERGE KPI:", e)
            
        print(f"Batch {epoch_id} processed completely (Vib, Alerts, KPIs).")
    finally:
        conn.close()

# Suppress verbose INFO logs, keep only WARNING and ERROR messages 
# so the ASCII table predictions are easily visible.
#spark.sparkContext.setLogLevel("WARN")

# Schema for incoming JSON data
schema = StructType([
    StructField("motor_id", StringType(), True),
    StructField("rpm", DoubleType()),
    StructField("vib_rms", DoubleType()),
    StructField("vib_peak", DoubleType()),
    StructField("vib_kurtosis", DoubleType()),
    StructField("fft_dominant_freq", DoubleType()),
    StructField("fft_max_amplitude", DoubleType()),
    StructField("fft_total_power", DoubleType()),
    StructField("current_rms", DoubleType()),
    StructField("current_thd", DoubleType()),
    StructField("temperature", DoubleType())
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

# Output predictions to Oracle via foreachBatch
query = df_with_predictions.writeStream \
    .foreachBatch(write_to_oracle) \
    .outputMode("append") \
    .start()

query.awaitTermination()
