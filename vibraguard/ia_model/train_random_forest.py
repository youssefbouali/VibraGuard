import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

print("="*80)
print("ENTRAÎNEMENT RANDOM FOREST POUR DÉTECTION D'ANOMALIES")
print("="*80)
print()

# Chargement des données
print("📊 Chargement des données...")
df = pd.read_csv('/home/claude/sensor_data_training.csv')
print(f"   ✓ {len(df)} échantillons chargés\n")

# Affichage des premières lignes
print("Aperçu des données:")
print(df.head())
print()

# Sélection des features pour l'entraînement
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
y = df['label']  # NORMAL ou ANOMALY

print(f"Features utilisées: {len(feature_columns)}")
for i, col in enumerate(feature_columns, 1):
    print(f"  {i}. {col}")
print()

# Séparation train/test
print("🔀 Séparation des données (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"   ✓ Train: {len(X_train)} échantillons")
print(f"   ✓ Test: {len(X_test)} échantillons\n")

# Normalisation des features
print("📏 Normalisation des features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
print("   ✓ Normalisation terminée\n")

# Entraînement du Random Forest
print("🌲 Entraînement du Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train_scaled, y_train)
print("   ✓ Modèle entraîné !\n")

# Prédictions
print("🔮 Prédictions sur le jeu de test...")
y_pred = rf_model.predict(X_test_scaled)
print("   ✓ Prédictions effectuées\n")

# Évaluation
print("="*80)
print("RÉSULTATS DE L'ÉVALUATION")
print("="*80)
print()

accuracy = accuracy_score(y_test, y_pred)
print(f"🎯 Accuracy globale: {accuracy*100:.2f}%\n")

print("📋 Rapport de classification détaillé:")
print(classification_report(y_test, y_pred, target_names=['ANOMALY', 'NORMAL']))

# Matrice de confusion
print("\n📊 Matrice de confusion:")
cm = confusion_matrix(y_test, y_pred)
print(cm)
print()

# Importance des features
print("="*80)
print("IMPORTANCE DES FEATURES")
print("="*80)
print()

feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

print("Classement des features par importance:")
for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:25s} : {row['importance']*100:5.2f}%")
print()

# Visualisation de l'importance des features
plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'], feature_importance['importance'])
plt.xlabel('Importance')
plt.title('Importance des Features - Random Forest')
plt.tight_layout()
plt.savefig('/home/claude/feature_importance.png', dpi=150, bbox_inches='tight')
print("✓ Graphique d'importance sauvegardé: feature_importance.png\n")

# Matrice de confusion visualisée
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['ANOMALY', 'NORMAL'],
            yticklabels=['ANOMALY', 'NORMAL'])
plt.ylabel('Vraie classe')
plt.xlabel('Classe prédite')
plt.title('Matrice de Confusion')
plt.tight_layout()
plt.savefig('/home/claude/confusion_matrix.png', dpi=150, bbox_inches='tight')
print("✓ Matrice de confusion sauvegardée: confusion_matrix.png\n")

# Test sur quelques échantillons
print("="*80)
print("TEST SUR ÉCHANTILLONS INDIVIDUELS")
print("="*80)
print()

# Prendre 5 échantillons aléatoires
test_samples = X_test.sample(5)
test_samples_scaled = scaler.transform(test_samples)
predictions = rf_model.predict(test_samples_scaled)
probabilities = rf_model.predict_proba(test_samples_scaled)

for i, (idx, sample) in enumerate(test_samples.iterrows()):
    true_label = y_test.loc[idx]
    pred_label = predictions[i]
    prob = probabilities[i]
    
    print(f"Échantillon {i+1}:")
    print(f"  RPM: {sample['rpm']:.1f} | Vib RMS: {sample['vib_rms']:.3f} mm/s | " +
          f"Temp: {sample['temperature']:.1f}°C")
    print(f"  Kurtosis: {sample['vib_kurtosis']:.2f} | Current RMS: {sample['current_rms']:.2f} A | " +
          f"THD: {sample['current_thd']:.2f}%")
    print(f"  ✓ Vraie classe: {true_label}")
    print(f"  ✓ Prédiction: {pred_label}")
    print(f"  ✓ Confiance: ANOMALY={prob[0]*100:.1f}%, NORMAL={prob[1]*100:.1f}%")
    if true_label == pred_label:
        print(f"  ✅ Prédiction correcte!")
    else:
        print(f"  ❌ Prédiction incorrecte!")
    print()

print("="*80)
print("ENTRAÎNEMENT TERMINÉ !")
print("="*80)
print()
print("Fichiers générés:")
print("  - feature_importance.png")
print("  - confusion_matrix.png")
print()
