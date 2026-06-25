import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler, StandardScaler, Imputer, StringIndexer, IndexToString
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml import Pipeline
from pyspark.ml.evaluation import MulticlassClassificationEvaluator

print("="*80)
print("ENTRAINEMENT RANDOM FOREST AVEC SPARK MLlib")
print("="*80)
print()

spark = SparkSession.builder \
    .appName("VibraGuardMLlibTrain") \
    .config("spark.sql.shuffle.partitions", "4") \
    .config("spark.driver.memory", "2g") \
    .config("spark.executor.memory", "2g") \
    .getOrCreate()

print("Chargement des donnees...")
data_path = 'sensor_data_training.csv'
pdf = pd.read_csv(data_path)
df = spark.createDataFrame(pdf)
print(f"Loaded {len(pdf)} samples")

# Drop rows with null label
df = df.dropna(subset=["anomaly_type"])

feature_columns = [
    'vib_rms', 'vib_peak', 'vib_kurtosis',
    'current_rms', 'current_thd', 'temperature'
]

imputer = Imputer(inputCols=feature_columns, outputCols=feature_columns, strategy="mean")

assembler = VectorAssembler(inputCols=feature_columns, outputCol="features_raw", handleInvalid="skip")

scaler = StandardScaler(inputCol="features_raw", outputCol="scaled_features", withMean=True, withStd=True)

labelIndexer = StringIndexer(inputCol="anomaly_type", outputCol="indexed_label", handleInvalid="keep")

rf = RandomForestClassifier(
    featuresCol="scaled_features",
    labelCol="indexed_label",
    numTrees=50,
    maxDepth=8,
    minInstancesPerNode=5,
    seed=42
)

pipeline = Pipeline(stages=[imputer, assembler, scaler, labelIndexer, rf])

train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

print("Training Random Forest with Spark MLlib...")
model = pipeline.fit(train_df)
print("Model trained!")

model.write().overwrite().save("/tmp/vibraguard_rf_pipeline")
print("/tmp/vibraguard_rf_pipeline saved")

train_pred = model.transform(train_df)
test_pred = model.transform(test_df)

evaluator_acc = MulticlassClassificationEvaluator(
    labelCol="indexed_label", predictionCol="prediction", metricName="accuracy"
)
evaluator_f1 = MulticlassClassificationEvaluator(
    labelCol="indexed_label", predictionCol="prediction", metricName="f1"
)
evaluator_precision = MulticlassClassificationEvaluator(
    labelCol="indexed_label", predictionCol="prediction", metricName="weightedPrecision"
)
evaluator_recall = MulticlassClassificationEvaluator(
    labelCol="indexed_label", predictionCol="prediction", metricName="weightedRecall"
)

train_acc = evaluator_acc.evaluate(train_pred)
test_acc = evaluator_acc.evaluate(test_pred)
test_precision = evaluator_precision.evaluate(test_pred)
test_recall = evaluator_recall.evaluate(test_pred)
test_f1 = evaluator_f1.evaluate(test_pred)

print(f"Train Accuracy: {train_acc*100:.2f}%")
print(f"Test Accuracy: {test_acc*100:.2f}%")
print(f"Precision: {test_precision*100:.2f}%")
print(f"Recall: {test_recall*100:.2f}%")
print(f"F1: {test_f1*100:.2f}%")

labels = model.stages[3].labels
y_true = [str(r.anomaly_type) for r in test_pred.select("anomaly_type").collect()]
y_pred_labels = [labels[int(r.prediction)] for r in test_pred.select("prediction").collect()]

print()
print("  Rapport par classe (test set):")
print("  " + "-"*73)
print(f"  {'Classe':<27} {'Precision':>8} {'Recall':>8} {'F1':>8} {'Support':>8}")
print("  " + "-"*73)
from sklearn.metrics import classification_report
report = classification_report(y_true, y_pred_labels, labels=labels, digits=3)
import re
def format_pct(m):
    val = float(m.group())
    return f"{val*100:.1f}%"
report_pct = re.sub(r'\b0\.\d{3}\b', format_pct, report)
for line in report_pct.split('\n'):
    if line.strip():
        print("  " + line)
print("  " + "-"*73)

cm = confusion_matrix(y_true, y_pred_labels, labels=labels)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=labels, yticklabels=labels)
plt.ylabel('True Class')
plt.xlabel('Predicted Class')
plt.title('Confusion Matrix - Spark MLlib RF')
plt.tight_layout()
plt.savefig('/tmp/confusion_matrix.png', dpi=150, bbox_inches='tight')
print("confusion_matrix.png saved")

importances = model.stages[-1].featureImportances
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': importances.toArray()
}).sort_values('importance', ascending=False)

plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'], feature_importance['importance'])
plt.xlabel('Importance')
plt.title('Feature Importance - Spark MLlib Random Forest')
plt.tight_layout()
plt.savefig('/tmp/feature_importance.png', dpi=150, bbox_inches='tight')
print("feature_importance.png saved")

print()
print("="*80)
print("TRAINING COMPLETE!")
print("="*80)

spark.stop()

import time
print("Training completed. Waiting 10 minutes before exit so you can copy files...")
time.sleep(600)
