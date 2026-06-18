import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import label_binarize
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns

print("="*80)
print("ENTRAINEMENT RANDOM FOREST POUR DETECTION D'ANOMALIES")
print("="*80)
print()

# Chargement des donnees
print("Chargement des donnees...")
data_path = 'sensor_data_training.csv'
if not os.path.exists(data_path):
    data_path = 'sensor_data_training.csv'
df = pd.read_csv(data_path)
print(f"Loaded {len(df)} samples")

# Selection des features pour l'entrainement
feature_columns = [
    'vib_rms',
    'vib_peak',
    'vib_kurtosis',
    'current_rms',
    'current_thd',
    'temperature'
]

X = df[feature_columns]
y = df['anomaly_type']

# Separation train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# --- NETTOYAGE DES DONNÉES ---
print("Nettoyage des données (Imputation et Outliers)...")
from sklearn.impute import SimpleImputer

# 1. Gestion des valeurs manquantes (Imputation par la moyenne)
imputer = SimpleImputer(strategy='mean')
X_train = pd.DataFrame(imputer.fit_transform(X_train), columns=feature_columns)
X_test = pd.DataFrame(imputer.transform(X_test), columns=feature_columns)

# 2. Gestion des outliers (Clipping aux percentiles 1% et 99%)
X_train = X_train.clip(lower=X_train.quantile(0.01), upper=X_train.quantile(0.99), axis=1)
X_test = X_test.clip(lower=X_train.quantile(0.01), upper=X_train.quantile(0.99), axis=1)

# Normalisation des features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Entrainement du Random Forest
print("Training Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train_scaled, y_train)
print("Model trained!")

# Sauvegarde du modele et du scaler
print("Saving model and scaler...")
joblib.dump(rf_model, 'vibraguard_rf_model.joblib')
joblib.dump(scaler, 'vibraguard_scaler.joblib')
print("vibraguard_rf_model.joblib saved")
print("vibraguard_scaler.joblib saved")

# Predictions et evaluation
y_train_pred = rf_model.predict(X_train_scaled)
train_accuracy = accuracy_score(y_train, y_train_pred)
y_pred = rf_model.predict(X_test_scaled)
test_accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

# Cross-Validation
cv_scores = cross_val_score(rf_model, X_train_scaled, y_train, cv=5, n_jobs=-1)

print(f"Train Accuracy: {train_accuracy*100:.2f}%")
print(f"Test Accuracy: {test_accuracy*100:.2f}%")
print(f"Accuracy: {test_accuracy*100:.2f}%")
print(f"Precision: {precision*100:.2f}%")
print(f"Recall: {recall*100:.2f}%")
print(f"F1: {f1*100:.2f}%")
print(f"Cross-Validation Mean Accuracy: {cv_scores.mean()*100:.2f}% (std: {cv_scores.std()*100:.2f}%)")

print()
print("  Rapport par classe (test set):")
print("  " + "-"*73)
print(f"  {'Classe':<27} {'Precision':>8} {'Recall':>8} {'F1':>8} {'Support':>8}")
print("  " + "-"*73)

from sklearn.metrics import classification_report
report = classification_report(y_test, y_pred, target_names=rf_model.classes_, digits=3)
# Convert decimal values to percentages
import re
def format_pct(m):
    val = float(m.group())
    return f"{val*100:.1f}%"
report_pct = re.sub(r'\b0\.\d{3}\b', format_pct, report)
for line in report_pct.split('\n'):
    if line.strip():
        print("  " + line)
print("  " + "-"*73)

# Importance des features
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

# Visualisation - Feature Importance
plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'], feature_importance['importance'])
plt.xlabel('Importance')
plt.title('Feature Importance - Random Forest')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=150, bbox_inches='tight')

# Matrice de confusion
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=rf_model.classes_,
            yticklabels=rf_model.classes_)
plt.ylabel('True Class')
plt.xlabel('Predicted Class')
plt.title('Confusion Matrix')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=150, bbox_inches='tight')

# ================ NEW: ROC CURVE (One-vs-Rest) ================
print("Generating ROC curves (One-vs-Rest)...")

# Binarize the output for multi-class ROC
y_test_bin = label_binarize(y_test, classes=rf_model.classes_)
n_classes = y_test_bin.shape[1]

# Get probability predictions
y_score = rf_model.predict_proba(X_test_scaled)

# Compute ROC curve and ROC area for each class
fpr = dict()
tpr = dict()
roc_auc = dict()

plt.figure(figsize=(10, 8))

for i in range(n_classes):
    fpr[i], tpr[i], _ = roc_curve(y_test_bin[:, i], y_score[:, i])
    roc_auc[i] = auc(fpr[i], tpr[i])
    plt.plot(fpr[i], tpr[i], lw=2,
             label=f'Class {rf_model.classes_[i]} (AUC = {roc_auc[i]:.2f})')

# Plot random guessing line
plt.plot([0, 1], [0, 1], 'k--', lw=2, label='Random Guessing')

plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Multi-class ROC Curve (One-vs-Rest)')
plt.legend(loc="lower right")
plt.tight_layout()
plt.savefig('ROC.png', dpi=150, bbox_inches='tight')
print("ROC.png saved successfully!")

print("="*80)
print("TRAINING COMPLETE!")
print("="*80)