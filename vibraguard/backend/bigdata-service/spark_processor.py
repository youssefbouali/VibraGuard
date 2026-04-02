import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, DoubleType
import configparser

# Database and Kafka Configurations
KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"
KAFKA_TOPIC = "vibration_data"

ORACLE_URL = "jdbc:oracle:thin:@localhost:1521:xe"
ORACLE_USER = "system"
ORACLE_PASSWORD = "password"
ORACLE_DRIVER = "oracle.jdbc.driver.OracleDriver"
ORACLE_TABLE = "VIBRATION_DATA"

def write_to_oracle(df, epoch_id):
    """
    Function to write each batch to Oracle Database
    """
    df.write \
        .format("jdbc") \
        .option("url", ORACLE_URL) \
        .option("dbtable", ORACLE_TABLE) \
        .option("user", ORACLE_USER) \
        .option("password", ORACLE_PASSWORD) \
        .option("driver", ORACLE_DRIVER) \
        .mode("append") \
        .save()
    print(f"Batch {epoch_id} successfully saved to Oracle.")

def main():
    # Initialize Spark Session with Kafka and Oracle JDBC dependencies
    spark = SparkSession.builder \
        .appName("IoT_Vibration_Spark_Processor") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.1") \
        .config("spark.jars", "ojdbc8.jar") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("WARN")

    # Define the schema of the incoming JSON data
    schema = StructType([
        StructField("motorId", StringType(), True),
        StructField("time", StringType(), True),
        StructField("x", DoubleType(), True),
        StructField("y", DoubleType(), True),
        StructField("z", DoubleType(), True)
    ])

    print(f"Listening to Kafka topic '{KAFKA_TOPIC}'...")

    # Read stream from Kafka
    df = spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS) \
        .option("subscribe", KAFKA_TOPIC) \
        .option("startingOffsets", "latest") \
        .load()

    # Convert the value column from Kafka (which is binary) to String, then parse JSON
    parsed_df = df.selectExpr("CAST(value AS STRING)") \
        .select(from_json(col("value"), schema).alias("data")) \
        .select("data.*")

    # Mapping to DB Columns: MOTOR_ID, VIBRATION_TIME, X, Y, Z
    # In Oracle, columns might be case sensitive but normally it handles mapping from schema
    final_df = parsed_df.withColumnRenamed("motorId", "MOTOR_ID") \
                        .withColumnRenamed("time", "VIBRATION_TIME") \
                        .withColumnRenamed("x", "X") \
                        .withColumnRenamed("y", "Y") \
                        .withColumnRenamed("z", "Z")

    # Start the stream and write batches to Oracle
    query = final_df.writeStream \
        .foreachBatch(write_to_oracle) \
        .outputMode("append") \
        .start()

    query.awaitTermination()

if __name__ == "__main__":
    main()
