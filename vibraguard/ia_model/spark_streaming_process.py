from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, from_json
from pyspark.sql.types import StructType, StructField, DoubleType, StringType
import joblib
import pandas as pd
import numpy as np
import os

# Configuration
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "sensor-data")
MODEL_PATH = "vibraguard_rf_model.joblib"
SCALER_PATH = "vibraguard_scaler.joblib"

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

# Create Spark Session
spark = SparkSession.builder \
    .appName("VibraGuardStreamingAI") \
    .getOrCreate()

# Schema for incoming JSON data
schema = StructType([
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

# Output predictions to console (for debugging)
query = df_with_predictions.writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

query.awaitTermination()
