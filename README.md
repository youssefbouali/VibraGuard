# 🛰️ OCP VibraGuard - Plateforme de Maintenance Prédictive I4.0

VibraGuard est une solution complète de surveillance et de diagnostic intelligent pour les actifs critiques (moteurs industriels). Elle combine l'IoT, le Big Data, l'intelligence artificielle et la Blockchain pour maximiser la disponibilité des équipements et optimiser les coûts de maintenance.

---

## 🏗️ Architecture Technique

Le projet repose sur une architecture microservices hautement disponible et scalable :

### 🔹 Microservices (Backend - Spring Boot/Python)
- **API Gateway** : Point d'entrée unique sécurisé pour le frontend.
- **IoT Service** : Orchestrateur de la collecte des données vibratoires en temps réel via MQTT et Kafka.
- **ML Service** : Moteur d'IA (FastAPI/Python) analysant les spectres vibratoires pour prédire les défaillances (déséquilibre, usure roulement, etc.).
- **BigData Service** : Traitement massif des données historiques avec Apache Spark pour les rapports BI.
- **Blockchain Service** : Enregistrement de l'historique des interventions et des audits sur un registre immuable pour une traçabilité totale.
- **User Service** : Gestion des identités, des rôles et de l'authentification (JWT).

### 🔹 Frontend (React / Vite)
- **Dashboard Temps Réel** : Visualisation dynamique des alertes et de la santé des moteurs.
- **Reporting BI** : Analyse multidimensionnelle des performances et des coûts.
- **Gestion Administrative** : Suivi des actifs, des ordres de travail et du personnel.

---

## 📊 Pipeline de Données IoT

Le flux de données suit un cycle de vie robuste pour garantir une latence minimale et une intégrité maximale :

1.  **Génération** : Des capteurs (simulés par Python) envoient des trames de données vibratoires (Vélocité RMS, Température, Accélération Peak).
2.  **Transmission** : Les données transitent par un broker **MQTT** (Mosquitto).
3.  **Ingestion & Streaming** : Le `iot-service` consomme les messages MQTT et les publie dans des topics **Apache Kafka**.
4.  **Traitement (Streaming Analytics)** : **Apache Spark** consomme les flux Kafka pour effectuer des agrégations et détecter des anomalies immédiates.
5.  **Intelligence Artificielle** : Les données filtrées sont envoyées au `ml-service` pour un score de confiance de défaillance.
6.  **Stockage** : Persistance dans une base de données **Oracle** pour les données structurées.
7.  **Audit Trail** : Chaque changement d'état critique est hashé et stocké dans la **Blockchain** pour l'auditabilité.

### 📝 Schéma des Données JSON (MQTT Payload)
Les messages envoyés par les capteurs respectent la structure suivante :
```json
{
  "motor_id": "MTR-Broyeur-04",
  "rpm": 1450.5,
  "vib_rms": 2.45,
  "vib_peak": 7.8,
  "vib_kurtosis": 3.12,
  "fft_dominant_freq": 24.5,
  "fft_max_amplitude": 4.1,
  "fft_total_power": 210.0,
  "current_rms": 8.5,
  "current_thd": 4.8,
  "temperature": 55.2
}
```

---

## 🚀 Installation et Déploiement

### Prérequis
- Docker Desktop / Minikube
- Java 17+ & Maven
- Node.js 18+
- Python 3.9+
- Oracle Database (ou instance Docker)

### Démarrage Rapide
1.  **Lancer l'infrastructure** :
    ```bash
    bash run-all.sh
    ```
2.  **Frontend** :
    ```bash
    cd vibraguard/frontend/client
    npm install
    npm run dev
    ```
3.  **Simulation IoT** :
    ```bash
    cd vibraguard/ia_model
    python external_mqtt_sender.py
    ```

---

## 🛠️ Stack Technologique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Lucide Icons, Recharts, Shadcn/UI |
| **Backend** | Spring Boot 3, Spring Cloud Gateway, FastAPI |
| **Big Data** | Apache Kafka, Apache Spark, MQTT (Mosquitto) |
| **Base de données** | Oracle Database, Redis (Caching) |
| **DevOps** | Docker, Kubernetes, GitHub Actions |
| **Blockchain** | Hyperledger Fabric / Ethereum (Web3j) |

---

## 🔒 Sécurité et Gouvernance
- Authentification **JWT** (Stateless).
- Chiffrement des données sensibles.
- Traçabilité des actions via Blockchain.
- Architecture basée sur le principe du "Privacy by Design".

---

© 2026 OCP Group - Maintenance 4.0 Excellence.
