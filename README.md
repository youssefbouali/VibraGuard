# VibraGuard - Plateforme Décisionnelle Intelligente

Plateforme de maintenance prédictive pour l'analyse des vibrations des moteurs industriels, basée sur une architecture microservices, IoT, Big Data et Blockchain.

## Architecture

Le projet suit une architecture microservices :

- **backend/**
  - `api-gateway` : Point d'entrée (Spring Cloud Gateway)
  - `iot-service` : Collecte des données capteurs (Spring Boot + MQTT/Kafka)
  - `bigdata-service` : Traitement Spark/Hadoop
  - `ml-service` : Maintenance prédictive (Python/FastAPI)
  - `blockchain-service` : Traçabilité (Spring Boot + Web3)
  - `ipfs-service` : Stockage décentralisé
- **frontend/**
  - `web-app` : Dashboard (Next.js)
  - `mobile-app` : Application techniciens (Flutter)
- **infrastructure/**
  - `k8s` : Manifestes Kubernetes
  - `docker` : Environnement de développement local

## Prérequis

- Java 17+
- Node.js 18+
- Python 3.9+
- Docker & Kubernetes (Minikube/K3s)
- Maven

## Démarrage

Voir le dossier `infrastructure/` pour les instructions de déploiement.
