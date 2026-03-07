import joblib
import pandas as pd
import numpy as np
import random

# Model paths
MODEL_PATH = "vibraguard_rf_model.joblib"
SCALER_PATH = "vibraguard_scaler.joblib"

# Feature definitions
FEATURE_COLUMNS = [
    'rpm', 'vib_rms', 'vib_peak', 'vib_kurtosis', 
    'fft_dominant_freq', 'fft_max_amplitude', 'fft_total_power', 
    'current_rms', 'current_thd', 'temperature'
]

import warnings
warnings.filterwarnings('ignore', category=UserWarning)

def generate_data(is_anomaly=False):
    """Generates data similar to the precise ranges in mqtt_sensor_simulator."""
    if is_anomaly:
        return {
            "rpm": random.uniform(1300, 1500),
            "vib_rms": random.uniform(5.0, 10.0),
            "vib_peak": random.uniform(15.0, 25.0),
            "vib_kurtosis": random.uniform(4.0, 8.0),
            "fft_dominant_freq": random.uniform(19.5, 29.5),
            "fft_max_amplitude": random.uniform(10.0, 20.0),
            "fft_total_power": random.uniform(500.0, 1000.0),
            "current_rms": random.uniform(12.0, 17.0),
            "current_thd": random.uniform(15.0, 25.0),
            "temperature": random.uniform(75.0, 95.0)
        }
    else:
        return {
            "rpm": random.uniform(1450, 1490),
            "vib_rms": random.uniform(2.0, 3.0),
            "vib_peak": random.uniform(7.0, 9.0),
            "vib_kurtosis": random.uniform(2.5, 3.5),
            "fft_dominant_freq": random.uniform(23.5, 25.5),
            "fft_max_amplitude": random.uniform(3.0, 5.0),
            "fft_total_power": random.uniform(150.0, 250.0),
            "current_rms": random.uniform(8.0, 9.0),
            "current_thd": random.uniform(4.0, 6.0),
            "temperature": random.uniform(50.0, 60.0)
        }

def main():
    print(f"Loading model from {MODEL_PATH}...")
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("✅ Model and scaler loaded successfully!")
    except FileNotFoundError:
        print("❌ Error: Model files not found. Did you run train_random_forest.py first?")
        return
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return

    print("\n--- Testing Model with Synthetic Data ---")
    
    # We will do 2 Normal tests and 3 Anomaly tests
    tests = [False, False, True, True, True]
    
    for i, is_anomaly in enumerate(tests):
        label = "INTENDED ANOMALY" if is_anomaly else "INTENDED NORMAL "
        
        # 1. Generate specific data
        data_dict = generate_data(is_anomaly)
        print(f"\nTest {i+1} [{label}]:")
        
        # 2. Convert to DataFrame (prevents the scikit UserWarning about lacking feature names)
        df_features = pd.DataFrame([data_dict])
        
        # 3. Scale the features
        scaled_features = scaler.transform(df_features)
        
        # 4. Make the prediction
        prediction = model.predict(scaled_features)[0]
        
        # 5. Output the result
        features_list = [data_dict[col] for col in FEATURE_COLUMNS]
        print(f"Input features:   {[round(x, 2) for x in features_list]}")
        
        if prediction == 'ANOMALY':
            print("Predicted status: 🔴 ANOMALY")
        else:
            print("Predicted status: 🟢 NORMAL")

if __name__ == "__main__":
    main()
