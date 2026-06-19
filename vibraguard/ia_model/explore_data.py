import pandas as pd
import os

# Path to the data
csv_path = 'sensor_data_training.csv'

if not os.path.exists(csv_path):
    print(f"❌ Error: File '{csv_path}' not found. Please run generate_sensor_data.py first.")
else:
    # Load data
    df = pd.read_csv(csv_path)

    print("="*50)
    print("EXPLORATION DES DONNÉES (Pandas)")
    print("="*50)

    print(f"\nFichier chargé : {csv_path}")
    print(f"Taille du dataset : {df.shape[0]} lignes, {df.shape[1]} colonnes")

    print("\n--- 5 PREMIÈRES LIGNES ---")
    print(df.head())

    print("\n--- RÉSUMÉ DES COLONNES ---")
    print(df.info())

    print("\n--- STATISTIQUES DESCRIPTIVES ---")
    print(df.describe())

    print("\n--- RÉPARTITION DES LABELS ---")
    print(df['label'].value_counts())

    print("\n--- RÉPARTITION DES TYPES D'ANOMALIES ---")
    print(df['anomaly_type'].value_counts())

    print("\n--- VÉRIFICATION DES VALEURS MANQUANTES (NaN) ---")
    print(df.isnull().sum())
