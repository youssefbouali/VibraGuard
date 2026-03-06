import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
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
    'rpm',
    'vib_rms',
    'vib_peak',
    'vib_kurtosis',
    'fft_dominant_freq',
    'fft_max_amplitude',
    'fft_total_power',
    'current_rms',
    'current_thd',
    'temperature'
]

X = df[feature_columns]
y = df['label']

# Separation train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

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
y_pred = rf_model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
print(f"Global Accuracy: {accuracy*100:.2f}%")

# Importance des features
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

# Visualisation
plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'], feature_importance['importance'])
plt.xlabel('Importance')
plt.title('Feature Importance - Random Forest')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=150, bbox_inches='tight')

# Matrice de confusion
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['ANOMALY', 'NORMAL'],
            yticklabels=['ANOMALY', 'NORMAL'])
plt.ylabel('True Class')
plt.xlabel('Predicted Class')
plt.title('Confusion Matrix')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=150, bbox_inches='tight')

print("="*80)
print("TRAINING COMPLETE!")
print("="*80)
