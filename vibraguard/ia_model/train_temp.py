import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
from sklearn.preprocessing import StandardScaler

print("Loading data...")
df = pd.read_csv('sensor_data_training.csv')
features = ['vib_rms','vib_peak','vib_kurtosis','current_rms','current_thd','temperature']
X = df[features].fillna(df[features].mean())

# Handling outliers by clipping
X = X.clip(lower=X.quantile(0.01), upper=X.quantile(0.99), axis=1)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

y = df['anomaly_type'].fillna('NONE')

print("Training model...")
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=1)
rf.fit(X_scaled, y)

joblib.dump(rf, 'vibraguard_rf_model.joblib')
joblib.dump(scaler, 'vibraguard_scaler.joblib')
print('Done!')
