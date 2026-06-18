import pandas as pd
import numpy as np
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

from imblearn.over_sampling import RandomOverSampler, SMOTE
from imblearn.under_sampling import RandomUnderSampler

print("=" * 80)
print("COMPARAISON DES STRATEGIES DE BALANCING - RANDOM FOREST")
print("=" * 80)

# ========== 1. LOAD DATA ==========
data_path = 'sensor_data_training.csv'
df = pd.read_csv(data_path)
print(f"\nDataset: {len(df)} echantillons, {len(df.columns)} colonnes")

feature_columns = ['vib_rms', 'vib_peak', 'vib_kurtosis', 'current_rms', 'current_thd', 'temperature']
X = df[feature_columns]
y = df['anomaly_type']

print("\nDistribution originale des classes:")
orig_dist = y.value_counts()
for cls, cnt in orig_dist.items():
    print(f"  {cls:25s} {cnt:4d} ({cnt/len(y)*100:5.1f}%)")

# ========== 2. TRAIN/TEST SPLIT (identique pour toutes les strategies) ==========
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTrain: {len(X_train)}, Test: {len(X_test)}")
print(f"Distribution train:\n{y_train.value_counts().to_string()}")
print(f"Distribution test:\n{y_test.value_counts().to_string()}")

# ========== 3. PREPROCESSING PIPELINE (identique pour toutes) ==========
imputer = SimpleImputer(strategy='mean')
X_train_imp = pd.DataFrame(imputer.fit_transform(X_train), columns=feature_columns)
X_test_imp = pd.DataFrame(imputer.transform(X_test), columns=feature_columns)

X_train_imp = X_train_imp.clip(lower=X_train_imp.quantile(0.01), upper=X_train_imp.quantile(0.99), axis=1)
X_test_imp = X_test_imp.clip(lower=X_train_imp.quantile(0.01), upper=X_train_imp.quantile(0.99), axis=1)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_imp)
X_test_scaled = scaler.transform(X_test_imp)

# ========== 4. DEFINIR LES STRATEGIES ==========
strategies = {
    "1. Stratify only (baseline)": {
        "type": "none",
        "desc": "Aucun balancing, seulement train_test_split(stratify=y)"
    },
    "2. RandomOverSampler": {
        "type": "oversample",
        "desc": "Surcharge aleatoire des classes minoritaires"
    },
    "3. SMOTE": {
        "type": "smote",
        "desc": "Generation synthetique d'echantillons minoritaires (SMOTE)"
    },
    "4. RandomUnderSampler": {
        "type": "undersample",
        "desc": "Sous-echantillonnage aleatoire de la classe majoritaire"
    },
    "5. Class Weight (balanced)": {
        "type": "classweight",
        "desc": "Poids equilibres automatiquement dans RandomForest"
    }
}

results = []
best_f1 = 0
best_model = None
best_scaler = None
best_strategy = None

# ========== 5. TESTER CHAQUE STRATEGIE ==========
for strategy_name, strategy_cfg in strategies.items():
    print(f"\n{'=' * 70}")
    print(f"{strategy_name}")
    print(f"{strategy_cfg['desc']}")
    print(f"{'=' * 70}")

    strategy_type = strategy_cfg["type"]

    # Appliquer le balancing UNIQUEMENT sur le train set
    if strategy_type == "none":
        X_bal, y_bal = X_train_scaled, y_train.copy()

    elif strategy_type == "oversample":
        ros = RandomOverSampler(random_state=42)
        X_bal, y_bal = ros.fit_resample(X_train_scaled, y_train)

    elif strategy_type == "smote":
        sm = SMOTE(random_state=42)
        X_bal, y_bal = sm.fit_resample(X_train_scaled, y_train)

    elif strategy_type == "undersample":
        rus = RandomUnderSampler(random_state=42)
        X_bal, y_bal = rus.fit_resample(X_train_scaled, y_train)

    elif strategy_type == "classweight":
        X_bal, y_bal = X_train_scaled, y_train.copy()
        # class_weight est passe au modele, pas besoin de modifier les donnees

    # Distribution apres balancing
    dist = pd.Series(y_bal).value_counts()
    print(f"Distribution apres balancing:")
    for cls, cnt in dist.items():
        print(f"  {cls:25s} {cnt:4d} ({cnt/len(y_bal)*100:5.1f}%)")

    # Entrainement
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced' if strategy_type == "classweight" else None
    )
    rf.fit(X_bal, y_bal)

    # Evaluation sur le test set (toujours non balance, comme en production)
    y_pred = rf.predict(X_test_scaled)
    y_train_pred = rf.predict(X_bal)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted')
    rec = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')

    # Cross-validation sur l'ensemble balanced
    cv_scores = cross_val_score(rf, X_bal, y_bal, cv=5, n_jobs=-1)

    print(f"\nResultats sur le TEST SET (non balance):")
    print(f"  Accuracy : {acc*100:.2f}%")
    print(f"  Precision: {prec*100:.2f}%")
    print(f"  Recall   : {rec*100:.2f}%")
    print(f"  F1-score : {f1*100:.2f}%")
    print(f"  CV (train): {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")

    # Rapport detaille par classe
    print(f"\n  Rapport par classe (test set):")
    print(f"  {'Classe':25s} {'Precision':>10s} {'Recall':>8s} {'F1':>8s} {'Support':>8s}")
    print(f"  {'-'*25} {'-'*10} {'-'*8} {'-'*8} {'-'*8}")
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    for cls in sorted(report.keys()):
        if cls not in ['accuracy', 'macro avg', 'weighted avg']:
            m = report[cls]
            print(f"  {cls:25s} {m['precision']*100:9.1f}% {m['recall']*100:7.1f}% {m['f1-score']*100:7.1f}% {m['support']:8.0f}")

    results.append({
        'strategy': strategy_name,
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1': f1,
        'cv_mean': cv_scores.mean(),
        'cv_std': cv_scores.std()
    })

    if f1 > best_f1:
        best_f1 = f1
        best_model = rf
        best_scaler = scaler
        best_strategy = strategy_name

# ========== 6. COMPARAISON FINALE ==========
print(f"\n{'=' * 80}")
print("COMPARAISON FINALE - TOUTES LES STRATEGIES")
print(f"{'=' * 80}")
print(f"{'Strategie':40s} {'Accuracy':>10s} {'Precision':>10s} {'Recall':>8s} {'F1':>8s} {'CV':>8s}")
print(f"{'-'*40} {'-'*10} {'-'*10} {'-'*8} {'-'*8} {'-'*8}")

for r in sorted(results, key=lambda x: x['f1'], reverse=True):
    print(f"{r['strategy']:40s} {r['accuracy']*100:9.2f}% {r['precision']*100:9.2f}% {r['recall']*100:7.2f}% {r['f1']*100:7.2f}% {r['cv_mean']*100:6.2f}%")

print(f"\nMeilleure strategie (F1): {best_strategy} ({best_f1*100:.2f}%)")

# ========== 7. SAUVEGARDER LE MEILLEUR MODELE ==========
print(f"\nSauvegarde du meilleur modele ({best_strategy})...")
joblib.dump(best_model, 'vibraguard_rf_model.joblib')
joblib.dump(best_scaler, 'vibraguard_scaler.joblib')
print("vibraguard_rf_model.joblib sauvegarde")
print("vibraguard_scaler.joblib sauvegarde")

print(f"\n{'=' * 80}")
print("COMPARAISON TERMINEE")
print(f"{'=' * 80}")
