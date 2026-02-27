import numpy as np
import pandas as pd
from scipy import signal
from datetime import datetime, timedelta
import random

# Configuration
np.random.seed(42)
SAMPLING_RATE = 1000  # Hz pour vibration
NUM_SAMPLES = 200  # Nombre d'échantillons à générer
NORMAL_RATIO = 0.70  # 70% de données normales
ANOMALY_TYPES = ['DESALIGNEMENT', 'DESEQUILIBRE', 'DEFAUT_ROULEMENT', 'SURCHARGE_ELECTRIQUE', 'SURCHAUFFE']

# Paramètres nominaux du moteur
NOMINAL_RPM = 1470  # RPM nominal (moteur asynchrone 50Hz, 4 pôles)
NOMINAL_TEMP = 55  # °C température nominale
NOMINAL_CURRENT = 8.5  # A courant nominal
NOMINAL_VIB_RMS = 2.5  # mm/s RMS vibration nominale

def generate_vibration_signal(duration=1.0, rpm=1470, anomaly_type=None, sampling_rate=1000):
    """
    Génère un signal de vibration temporel avec caractéristiques réalistes
    """
    t = np.linspace(0, duration, int(duration * sampling_rate))
    
    # Fréquence fondamentale du moteur
    f_rotation = rpm / 60.0  # Hz
    
    # Signal de base
    signal_vib = np.zeros_like(t)
    
    if anomaly_type is None or anomaly_type == 'NORMAL':
        # Vibration normale : composante 1x RPM dominante + harmoniques faibles
        signal_vib += 2.0 * np.sin(2 * np.pi * f_rotation * t)  # 1x RPM
        signal_vib += 0.3 * np.sin(2 * np.pi * 2 * f_rotation * t)  # 2x RPM
        signal_vib += 0.15 * np.sin(2 * np.pi * 3 * f_rotation * t)  # 3x RPM
        # Bruit blanc faible
        signal_vib += np.random.normal(0, 0.2, len(t))
        
    elif anomaly_type == 'DESEQUILIBRE':
        # Déséquilibre : amplitude élevée à 1x RPM
        signal_vib += 5.5 * np.sin(2 * np.pi * f_rotation * t)  # 1x RPM très fort
        signal_vib += 0.4 * np.sin(2 * np.pi * 2 * f_rotation * t)
        signal_vib += np.random.normal(0, 0.3, len(t))
        
    elif anomaly_type == 'DESALIGNEMENT':
        # Désalignement : forte composante à 2x RPM et 3x RPM
        signal_vib += 2.5 * np.sin(2 * np.pi * f_rotation * t)
        signal_vib += 4.0 * np.sin(2 * np.pi * 2 * f_rotation * t)  # 2x RPM dominant
        signal_vib += 2.5 * np.sin(2 * np.pi * 3 * f_rotation * t)  # 3x RPM
        signal_vib += np.random.normal(0, 0.4, len(t))
        
    elif anomaly_type == 'DEFAUT_ROULEMENT':
        # Défaut roulement : impulsions périodiques + hautes fréquences
        # BPFO (Ball Pass Frequency Outer race) ~= 3.5 x RPM typiquement
        f_bpfo = 3.5 * f_rotation
        signal_vib += 2.0 * np.sin(2 * np.pi * f_rotation * t)
        # Impulsions périodiques
        impulse_times = np.arange(0, duration, 1/f_bpfo)
        for imp_t in impulse_times:
            idx = int(imp_t * sampling_rate)
            if idx < len(signal_vib):
                # Impulsion amortie
                decay = np.exp(-50 * (t[idx:] - t[idx]))
                signal_vib[idx:] += 8.0 * decay * np.sin(2 * np.pi * 5000 * (t[idx:] - t[idx]))
        # Bruit haute fréquence
        signal_vib += np.random.normal(0, 0.8, len(t))
        
    elif anomaly_type == 'SURCHARGE_ELECTRIQUE':
        # Vibration similaire au normal mais légèrement augmentée
        signal_vib += 3.2 * np.sin(2 * np.pi * f_rotation * t)
        signal_vib += 0.5 * np.sin(2 * np.pi * 2 * f_rotation * t)
        signal_vib += np.random.normal(0, 0.3, len(t))
        
    elif anomaly_type == 'SURCHAUFFE':
        # Vibration normale avec bruit légèrement augmenté
        signal_vib += 2.3 * np.sin(2 * np.pi * f_rotation * t)
        signal_vib += 0.35 * np.sin(2 * np.pi * 2 * f_rotation * t)
        signal_vib += np.random.normal(0, 0.35, len(t))
    
    return t, signal_vib

def calculate_rms(signal_data):
    """Calcule la valeur RMS d'un signal"""
    return np.sqrt(np.mean(signal_data ** 2))

def calculate_fft_features(signal_data, sampling_rate):
    """
    Calcule les caractéristiques FFT
    Retourne: fréquence dominante, amplitude max, puissance totale
    """
    # FFT
    fft_vals = np.fft.rfft(signal_data)
    fft_freq = np.fft.rfftfreq(len(signal_data), 1/sampling_rate)
    fft_power = np.abs(fft_vals) ** 2
    
    # Fréquence dominante
    dominant_freq_idx = np.argmax(fft_power[1:]) + 1  # Ignore DC
    dominant_freq = fft_freq[dominant_freq_idx]
    
    # Amplitude max du spectre
    max_amplitude = np.max(np.abs(fft_vals[1:]))
    
    # Puissance totale du spectre
    total_power = np.sum(fft_power)
    
    return dominant_freq, max_amplitude, total_power

def calculate_kurtosis(signal_data):
    """Calcule le kurtosis (mesure de l'aplatissement de la distribution)"""
    mean = np.mean(signal_data)
    std = np.std(signal_data)
    if std == 0:
        return 0
    return np.mean(((signal_data - mean) / std) ** 4)

def calculate_current_thd(current_signal, fundamental_freq, sampling_rate):
    """
    Calcule le THD (Total Harmonic Distortion) du courant
    """
    # FFT du signal de courant
    fft_vals = np.fft.rfft(current_signal)
    fft_freq = np.fft.rfftfreq(len(current_signal), 1/sampling_rate)
    fft_power = np.abs(fft_vals) ** 2
    
    # Trouver la puissance de la fondamentale (50Hz typiquement)
    fund_idx = np.argmin(np.abs(fft_freq - fundamental_freq))
    fund_power = fft_power[fund_idx]
    
    # Puissance des harmoniques (2x, 3x, 4x, 5x fondamentale)
    harmonic_power = 0
    for h in range(2, 6):
        harm_freq = h * fundamental_freq
        harm_idx = np.argmin(np.abs(fft_freq - harm_freq))
        harmonic_power += fft_power[harm_idx]
    
    # THD = sqrt(somme harmoniques / fondamentale)
    if fund_power > 0:
        thd = np.sqrt(harmonic_power / fund_power) * 100  # En %
    else:
        thd = 0
    
    return thd

def generate_current_signal(duration=1.0, rms_current=8.5, anomaly_type=None, sampling_rate=1000):
    """
    Génère un signal de courant avec THD réaliste
    """
    t = np.linspace(0, duration, int(duration * sampling_rate))
    fundamental_freq = 50  # Hz (fréquence du réseau)
    
    if anomaly_type is None or anomaly_type == 'NORMAL':
        # Courant normal : sinusoïde pure + harmoniques faibles
        amplitude = rms_current * np.sqrt(2)
        signal_current = amplitude * np.sin(2 * np.pi * fundamental_freq * t)
        # Harmoniques de rang 3 et 5 (typique)
        signal_current += 0.05 * amplitude * np.sin(2 * np.pi * 3 * fundamental_freq * t)
        signal_current += 0.03 * amplitude * np.sin(2 * np.pi * 5 * fundamental_freq * t)
        signal_current += np.random.normal(0, 0.1, len(t))
        
    elif anomaly_type == 'SURCHARGE_ELECTRIQUE':
        # Surcharge : courant RMS augmenté + THD élevé
        amplitude = (rms_current * 1.4) * np.sqrt(2)
        signal_current = amplitude * np.sin(2 * np.pi * fundamental_freq * t)
        # Harmoniques importantes
        signal_current += 0.15 * amplitude * np.sin(2 * np.pi * 3 * fundamental_freq * t)
        signal_current += 0.10 * amplitude * np.sin(2 * np.pi * 5 * fundamental_freq * t)
        signal_current += 0.08 * amplitude * np.sin(2 * np.pi * 7 * fundamental_freq * t)
        signal_current += np.random.normal(0, 0.2, len(t))
        
    else:
        # Autres anomalies : courant légèrement perturbé
        amplitude = rms_current * np.sqrt(2)
        signal_current = amplitude * np.sin(2 * np.pi * fundamental_freq * t)
        signal_current += 0.08 * amplitude * np.sin(2 * np.pi * 3 * fundamental_freq * t)
        signal_current += 0.05 * amplitude * np.sin(2 * np.pi * 5 * fundamental_freq * t)
        signal_current += np.random.normal(0, 0.15, len(t))
    
    return t, signal_current

def generate_temperature(base_temp=55, anomaly_type=None):
    """
    Génère une température avec variations réalistes
    """
    if anomaly_type is None or anomaly_type == 'NORMAL':
        # Température normale avec petite variation
        temp = base_temp + np.random.normal(0, 2)
        
    elif anomaly_type == 'SURCHAUFFE':
        # Surchauffe
        temp = base_temp + np.random.uniform(20, 35)
        
    elif anomaly_type == 'SURCHARGE_ELECTRIQUE':
        # Température élevée due à surcharge
        temp = base_temp + np.random.uniform(12, 22)
        
    else:
        # Autres anomalies : température légèrement élevée
        temp = base_temp + np.random.uniform(5, 12)
    
    return temp

def generate_dataset(num_samples=200):
    """
    Génère un dataset complet pour entraînement Random Forest
    """
    data = []
    
    # Nombre d'échantillons normaux vs anomalies
    num_normal = int(num_samples * NORMAL_RATIO)
    num_anomalies = num_samples - num_normal
    
    # Répartition des anomalies
    anomalies_per_type = num_anomalies // len(ANOMALY_TYPES)
    
    sample_id = 1
    timestamp = datetime.now()
    
    print(f"Génération de {num_samples} échantillons...")
    print(f"  - Normal: {num_normal}")
    print(f"  - Anomalies: {num_anomalies} ({anomalies_per_type} par type)")
    print()
    
    # Générer les échantillons normaux
    for i in range(num_normal):
        rpm = NOMINAL_RPM + np.random.uniform(-20, 20)
        
        # Signal de vibration
        t_vib, signal_vib = generate_vibration_signal(duration=1.0, rpm=rpm, anomaly_type='NORMAL')
        vib_rms = calculate_rms(signal_vib)
        vib_peak = np.max(np.abs(signal_vib))
        dominant_freq, max_fft_amp, total_power = calculate_fft_features(signal_vib, SAMPLING_RATE)
        kurtosis = calculate_kurtosis(signal_vib)
        
        # Signal de courant
        t_curr, signal_curr = generate_current_signal(duration=1.0, rms_current=NOMINAL_CURRENT, anomaly_type='NORMAL')
        current_rms = calculate_rms(signal_curr)
        current_thd = calculate_current_thd(signal_curr, 50, SAMPLING_RATE)
        
        # Température
        temperature = generate_temperature(base_temp=NOMINAL_TEMP, anomaly_type='NORMAL')
        
        data.append({
            'timestamp': timestamp + timedelta(seconds=i*10),
            'sample_id': sample_id,
            'moteur_id': f'MOT_{random.randint(1, 10):03d}',
            'rpm': rpm,
            'vib_rms': vib_rms,
            'vib_peak': vib_peak,
            'vib_kurtosis': kurtosis,
            'fft_dominant_freq': dominant_freq,
            'fft_max_amplitude': max_fft_amp,
            'fft_total_power': total_power,
            'current_rms': current_rms,
            'current_thd': current_thd,
            'temperature': temperature,
            'label': 'NORMAL',
            'anomaly_type': 'NONE'
        })
        sample_id += 1
    
    # Générer les anomalies
    for anomaly_type in ANOMALY_TYPES:
        for i in range(anomalies_per_type):
            # Variations de RPM selon le type d'anomalie
            if anomaly_type in ['DESEQUILIBRE', 'DESALIGNEMENT']:
                rpm = NOMINAL_RPM + np.random.uniform(-30, 30)
            elif anomaly_type == 'SURCHARGE_ELECTRIQUE':
                rpm = NOMINAL_RPM + np.random.uniform(-50, -20)  # RPM réduit
            else:
                rpm = NOMINAL_RPM + np.random.uniform(-25, 25)
            
            # Signal de vibration
            t_vib, signal_vib = generate_vibration_signal(duration=1.0, rpm=rpm, anomaly_type=anomaly_type)
            vib_rms = calculate_rms(signal_vib)
            vib_peak = np.max(np.abs(signal_vib))
            dominant_freq, max_fft_amp, total_power = calculate_fft_features(signal_vib, SAMPLING_RATE)
            kurtosis = calculate_kurtosis(signal_vib)
            
            # Signal de courant
            current_nominal = NOMINAL_CURRENT
            if anomaly_type == 'SURCHARGE_ELECTRIQUE':
                current_nominal *= 1.3
            t_curr, signal_curr = generate_current_signal(duration=1.0, rms_current=current_nominal, anomaly_type=anomaly_type)
            current_rms = calculate_rms(signal_curr)
            current_thd = calculate_current_thd(signal_curr, 50, SAMPLING_RATE)
            
            # Température
            temperature = generate_temperature(base_temp=NOMINAL_TEMP, anomaly_type=anomaly_type)
            
            data.append({
                'timestamp': timestamp + timedelta(seconds=(num_normal + i)*10),
                'sample_id': sample_id,
                'moteur_id': f'MOT_{random.randint(1, 10):03d}',
                'rpm': rpm,
                'vib_rms': vib_rms,
                'vib_peak': vib_peak,
                'vib_kurtosis': kurtosis,
                'fft_dominant_freq': dominant_freq,
                'fft_max_amplitude': max_fft_amp,
                'fft_total_power': total_power,
                'current_rms': current_rms,
                'current_thd': current_thd,
                'temperature': temperature,
                'label': 'ANOMALY',
                'anomaly_type': anomaly_type
            })
            sample_id += 1
    
    # Créer le DataFrame et mélanger
    df = pd.DataFrame(data)
    df = df.sample(frac=1).reset_index(drop=True)  # Mélanger les données
    
    return df

# Génération du dataset
print("="*80)
print("GÉNÉRATION DE DONNÉES SIMULÉES POUR RANDOM FOREST")
print("="*80)
print()

df_train = generate_dataset(num_samples=NUM_SAMPLES)

# Statistiques
print("\n" + "="*80)
print("STATISTIQUES DU DATASET")
print("="*80)
print(f"\nNombre total d'échantillons: {len(df_train)}")
print(f"\nRépartition des labels:")
print(df_train['label'].value_counts())
print(f"\nRépartition des types d'anomalies:")
print(df_train['anomaly_type'].value_counts())

print(f"\n\nStatistiques descriptives des features:")
print(df_train.describe())

# Sauvegarde
csv_filename = '/home/claude/sensor_data_training.csv'
df_train.to_csv(csv_filename, index=False)
print(f"\n✅ Dataset sauvegardé: {csv_filename}")

# Afficher quelques exemples
print(f"\n\n{'='*80}")
print("EXEMPLES D'ÉCHANTILLONS")
print("="*80)
print("\n--- Échantillons NORMAUX ---")
print(df_train[df_train['label'] == 'NORMAL'].head(3).to_string())

print("\n\n--- Échantillons ANOMALIES ---")
for anomaly in ANOMALY_TYPES:
    print(f"\n{anomaly}:")
    sample = df_train[df_train['anomaly_type'] == anomaly].head(1)
    if not sample.empty:
        print(sample.to_string())

print("\n" + "="*80)
print("GÉNÉRATION TERMINÉE !")
print("="*80)
