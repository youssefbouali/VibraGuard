import pandas as pd
import numpy as np
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Algorithmes
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("COMPARAISON DES ALGORITHMES DE MACHINE LEARNING")
print("="*80)

data_path = 'sensor_data_training.csv'
if not os.path.exists(data_path):
    print("Fichier de donnees non trouve!")
    exit(1)

df = pd.read_csv(data_path)
print(f"Lignes chargees: {len(df)}")

feature_columns = [
    'rpm', 'vib_rms', 'vib_peak', 'vib_kurtosis',
    'fft_dominant_freq', 'fft_max_amplitude', 'fft_total_power',
    'current_rms', 'current_thd', 'temperature'
]

X = df[feature_columns]
y = df['label']

# Encode labels if they are string ('NORMAL', 'ANOMALY')
if y.dtype == object:
    y = np.where(y == 'ANOMALY', 1, 0)
    print("Labels encodes: ANOMALY=1, NORMAL=0")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "SVM (RBF)": SVC(kernel='rbf', random_state=42, probability=True),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "MLP (Neural Net)": MLPClassifier(hidden_layer_sizes=(100,), max_iter=500, random_state=42)
}

results = []

print("\nEntrainement et evaluation des modeles...")
for name, model in models.items():
    print(f" --> {name}...")
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted')
    rec = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    results.append({
        "Modele": name,
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1-Score": f1,
        "ObjetModele": model
    })

# Convertir les resultats en DataFrame pour un affichage facile
results_df = pd.DataFrame(results).sort_values(by="F1-Score", ascending=False)

print("\n" + "="*80)
print(results_df.drop('ObjetModele', axis=1).to_string(index=False))
print("="*80)

# Trouver le meilleur modele (selon le F1-Score ou l'Accuracy)
best_model_name = results_df.iloc[0]["Modele"]
best_model_obj = results_df.iloc[0]["ObjetModele"]
best_acc = results_df.iloc[0]["Accuracy"]

print(f"\n🏆 LE MEILLEUR MODELE EST: {best_model_name.upper()} (Precision globale: {best_acc*100:.2f}%)")

# Sauvegarde du meilleur modele
print(f"Sauvegarde du meilleur modele selectionne...")
joblib.dump(best_model_obj, 'vibraguard_best_model.joblib')
joblib.dump(scaler, 'vibraguard_best_scaler.joblib')
print("Fichiers sauvegardes: vibraguard_best_model.joblib et vibraguard_best_scaler.joblib")

# Visualisation des barres
plt.figure(figsize=(12, 6))
sns.barplot(x='Accuracy', y='Modele', data=results_df, palette='viridis')
plt.title('Comparaison de la Précision Globale des Modèles')
plt.xlim(0.8, 1.0)
plt.tight_layout()
plt.savefig('models_comparison.png', dpi=150)
print("\nGraphique de comparaison enregistre: models_comparison.png")
