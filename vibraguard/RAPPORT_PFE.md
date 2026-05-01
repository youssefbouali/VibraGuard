# RAPPORT DE PROJET DE FIN D'ÉTUDES (PFE)

---

**Titre du Projet :** VibraGuard - Plateforme Intelligente de Maintenance Prédictive pour Moteurs Industriels basée sur l'IoT, l'Intelligence Artificielle et la Blockchain  
**Présenté par :** [Votre Nom/Prénom]  
**Encadré par :** [Nom de l'Encadrant]  
**Année Universitaire :** 2025/2026  
**Établissement :** [Nom de votre Université/École - ex: Master Ingénierie Logicielle (IL) S4]

---

## REMERCIEMENTS
Je tiens à exprimer ma profonde gratitude à mon encadrant, [Nom de l'encadrant], pour son soutien continu, ses conseils précieux et son orientation tout au long de ce projet. Mes remerciements s'adressent également au corps professoral de [Nom de l'établissement] pour la qualité de l'enseignement dispensé. Enfin, je remercie ma famille et mes proches pour leur soutien inconditionnel.

---

## RÉSUMÉ
Dans le contexte de l'Industrie 4.0, la maintenance des équipements industriels est un enjeu majeur. Le projet **VibraGuard** propose une solution complète de maintenance prédictive pour les moteurs industriels. En combinant l'Internet des Objets (IoT) pour la collecte de données en temps réel, Apache Kafka et Spark pour le streaming de données, et des algorithmes d'Intelligence Artificielle (Random Forest) pour la détection d'anomalies, VibraGuard permet d'anticiper les pannes. La plateforme intègre une architecture microservices robuste (Spring Boot), une interface utilisateur dynamique (React) et exploite la technologie Blockchain pour garantir l'immutabilité et la traçabilité des rapports et des ordres de travail.

**Mots-clés :** Industrie 4.0, Maintenance Prédictive, Machine Learning, Random Forest, IoT, Apache Kafka, Apache Spark, Spring Boot, Microservices, Blockchain, React.

---

## TABLE DES MATIÈRES
1. [Introduction Générale](#introduction-générale)
2. [Chapitre 1 : Contexte et État de l'Art](#chapitre-1--contexte-et-état-de-lart)
3. [Chapitre 2 : Analyse et Spécification des Besoins](#chapitre-2--analyse-et-spécification-des-besoins)
4. [Chapitre 3 : Architecture et Choix Technologiques](#chapitre-3--architecture-et-choix-technologiques)
5. [Chapitre 4 : Implémentation du Pipeline de Données et de l'IA](#chapitre-4--implémentation-du-pipeline-de-données-et-de-lia)
6. [Chapitre 5 : Développement du Backend, Frontend et Blockchain](#chapitre-5--développement-du-backend-frontend-et-blockchain)
7. [Conclusion Générale et Perspectives](#conclusion-générale-et-perspectives)

---

## INTRODUCTION GÉNÉRALE
Le secteur industriel moderne fait face à une exigence croissante de productivité et de réduction des coûts. Les arrêts de production imprévus causés par des défaillances de machines, notamment les moteurs asynchrones, entraînent des pertes financières colossales. Traditionnellement, la maintenance est soit réactive (réparation après panne) soit préventive (interventions planifiées à intervalles réguliers). 

Cependant, ces approches montrent leurs limites : la première est coûteuse en temps d'arrêt, tandis que la seconde peut entraîner le remplacement prématuré de pièces encore fonctionnelles. Avec l'avènement de l'Industrie 4.0, la **maintenance prédictive** s'impose comme la solution optimale, utilisant l'analyse de données pour prédire les pannes avant qu'elles ne surviennent.

Le projet **VibraGuard** s'inscrit dans cette dynamique. Son objectif est de concevoir et développer une plateforme centralisée capable de surveiller en temps réel l'état de santé des moteurs industriels, d'analyser les données issues de capteurs (vibrations, température, courant, vitesse), de détecter les anomalies grâce à l'intelligence artificielle, et de gérer les interventions (Ordres de Travail) de manière sécurisée via la blockchain.

---

## CHAPITRE 1 : CONTEXTE ET ÉTAT DE L'ART

### 1.1 L'évolution de la Maintenance Industrielle
La maintenance a évolué de l'approche "run-to-failure" vers des stratégies plus intelligentes. La maintenance prédictive (PdM) représente le summum de cette évolution, s'appuyant sur l'acquisition continue de données et l'analyse prédictive.

### 1.2 Le Rôle de l'IoT et du Big Data
Les capteurs IoT modernes permettent de collecter des données à haute fréquence. Dans VibraGuard, les signaux vibratoires, le courant électrique et la température sont cruciaux. Ces flux massifs nécessitent des outils Big Data comme Apache Kafka pour le transport et Apache Spark pour le traitement en flux (Stream Processing).

### 1.3 L'Intelligence Artificielle pour la Détection d'Anomalies
Les algorithmes de Machine Learning, notamment les forêts aléatoires (Random Forest), sont particulièrement efficaces pour classifier des données multivariées complexes et isoler des signatures de défauts (déséquilibre, désalignement, défaut de roulement, surchauffe).

### 1.4 La Blockchain dans l'Industrie
L'intégration de la Blockchain (Smart Contracts) permet de sceller les rapports d'inspection et les ordres de travail, assurant une auditabilité parfaite et une confiance renforcée entre les différents acteurs (techniciens, managers, prestataires externes).

---

## CHAPITRE 2 : ANALYSE ET SPÉCIFICATION DES BESOINS

### 2.1 Les Acteurs du Système
- **L'Opérateur / Technicien :** Visualise l'état des moteurs, reçoit les alertes, exécute les ordres de travail.
- **Le Responsable Maintenance :** Supervise les KPI globaux, planifie les interventions, gère les accès.
- **Le Système IoT :** Entité autonome envoyant des données brutes en continu.

### 2.2 Besoins Fonctionnels
1. **Acquisition de données :** Le système doit recevoir en temps réel les données simulées/réelles des capteurs IoT via MQTT.
2. **Détection d'anomalies :** Le système doit analyser les données et classifier l'état du moteur (Normal ou type d'anomalie) en temps réel.
3. **Tableau de bord (Dashboard) :** Affichage des KPI (taux de disponibilité, nombre d'alertes), de l'état de santé par moteur, et de l'historique.
4. **Gestion des Ordres de Travail (OT) :** Création, assignation et suivi du statut des interventions.
5. **Sécurisation Blockchain :** Enregistrement de l'empreinte (hash) des rapports finaux d'intervention sur la blockchain.

### 2.3 Besoins Non-Fonctionnels
- **Scalabilité :** Capacité à gérer l'ajout de nouveaux capteurs grâce à l'architecture Microservices et Kafka.
- **Temps réel :** Latence minimale entre l'émission d'une anomalie et l'alerte sur le dashboard.
- **Fiabilité :** Tolérance aux pannes du système d'ingestion.

---

## CHAPITRE 3 : ARCHITECTURE ET CHOIX TECHNOLOGIQUES

Pour répondre aux exigences de scalabilité et de modularité, une architecture distribuée a été adoptée.

### 3.1 Architecture Globale
L'architecture de VibraGuard se divise en quatre couches majeures :
1. **Couche Edge/IoT :** Simulateur de capteurs MQTT (générant des signaux physiques réalistes).
2. **Couche Ingestion & Data Processing :** Apache Kafka agit comme un broker de messages à haut débit. Apache Spark Streaming consomme ces messages, applique le modèle IA, et renvoie les résultats prédictifs.
3. **Couche Backend / Microservices :** Développée en Spring Boot (Java), incluant un API Gateway, des services métiers pour les moteurs et les notifications, et la persistance dans une base de données relationnelle.
4. **Couche Présentation (Frontend) :** Application Single Page (SPA) développée en React.
5. **Couche Trust (Blockchain) :** Nœud Hardhat déployant des Smart Contracts pour la certification des données critiques.

### 3.2 Choix Technologiques
- **Backend :** Java 17, Spring Boot, Spring Cloud, Hibernate/JPA.
- **Frontend :** React, TypeScript, Tailwind CSS, Vite.
- **Data Science & Streaming :** Python, Pandas, Scikit-Learn (Random Forest), Apache Spark (PySpark), Apache Kafka, MQTT.
- **Blockchain :** Solidity, Hardhat, Ethers.js.
- **Infrastructure :** Kubernetes (déploiement des nœuds blockchain et services).

---

## CHAPITRE 4 : IMPLÉMENTATION DU PIPELINE DE DONNÉES ET DE L'IA

Cette phase est le cœur "intelligent" du projet.

### 4.1 Génération et Simulation de Données (`generate_sensor_data.py`)
Un simulateur physique a été développé pour générer des signaux réalistes. Des modèles mathématiques simulent les vibrations (harmoniques du régime moteur RPM). 
Pour garantir la robustesse du modèle IA, le dataset inclut :
- Des données normales avec des variations naturelles.
- Des anomalies spécifiques : *Désalignement, Déséquilibre, Défaut de roulement, Surcharge électrique, Surchauffe*.
- L'injection volontaire de "bruit" (valeurs manquantes NaN, outliers extrêmes) pour nécessiter une phase de nettoyage des données (Data Cleaning).

### 4.2 Nettoyage et Entraînement du Modèle (`train_random_forest.py`)
Le pipeline de Machine Learning suit ces étapes :
1. **Imputation :** Remplacement des valeurs manquantes par la moyenne (SimpleImputer).
2. **Filtrage (Clipping) :** Limitation des valeurs extrêmes aberrantes pour éviter de biaiser l'apprentissage.
3. **Normalisation :** Mise à l'échelle des variables (StandardScaler).
4. **Modélisation :** Utilisation de l'algorithme **Random Forest Classifier**. Cet algorithme a été choisi pour sa capacité à gérer des données non linéaires et son excellente résistance au surapprentissage (overfitting).
5. **Évaluation :** Le modèle atteint une précision réaliste de ~95%, capable d'isoler efficacement les défauts mécaniques et électriques. Les modèles entraînés sont sauvegardés via `joblib`.

### 4.3 Traitement en Streaming (Spark Streaming)
Le script `spark_streaming_process.py` se connecte au cluster Kafka. Il consomme les données brutes par micro-batchs, applique le scaler et le modèle Random Forest pré-entraîné, puis pousse les prédictions et les KPI mis à jour vers le Backend via des appels API REST.

---

## CHAPITRE 5 : DÉVELOPPEMENT DU BACKEND, FRONTEND ET BLOCKCHAIN

### 5.1 L'Architecture Microservices (Backend)
Le backend a été conçu pour être hautement découplé. L'**API Gateway** gère le routage et la sécurité. Les entités principales comme `Motor` et `VibrationData` ont été épurées (retrait d'anciennes features superflues) pour optimiser les performances. 
Les contrôleurs exposent des endpoints REST clairs pour la gestion du parc de machines et la récupération des historiques d'anomalies.

### 5.2 L'Interface Utilisateur (Frontend)
Le frontend React offre une expérience utilisateur moderne (mode sombre, couleurs adaptatives selon la criticité).
- **Le Dashboard Principal :** Présente les KPI globaux (disponibilité, santé moyenne) mis à jour en temps réel.
- **La Carte de Santé (SanteCard) :** Visualisation intuitive (jauges circulaires) de l'état d'un moteur spécifique.
- **La Vue détaillée :** Affiche les caractéristiques techniques du moteur et son statut. L'interface se concentre sur la "Détection d'anomalies" par IA de manière épurée et professionnelle.

### 5.3 L'Intégration Blockchain
Pour certifier les interventions de maintenance, un réseau blockchain privé (Hardhat) est utilisé. Lorsqu'un "Ordre de Travail" est finalisé ou qu'un rapport critique est généré, un hachage cryptographique de ce document est inscrit dans un Smart Contract. Cela crée une piste d'audit inaltérable, indispensable pour les audits de conformité industrielle et les contrats d'assurance.

---

## CONCLUSION GÉNÉRALE ET PERSPECTIVES

Le projet **VibraGuard** démontre avec succès la viabilité et la puissance de la combinaison de l'IoT, du Machine Learning et de la Blockchain dans le domaine industriel. 

**Réalisations majeures :**
- Mise en place d'un pipeline de streaming Big Data (Kafka/Spark) fonctionnel.
- Entraînement et déploiement d'un modèle IA robuste capable de détecter des défaillances avec une grande précision, malgré l'introduction de bruit réaliste dans les données.
- Développement d'une plateforme web complète et réactive pour l'aide à la décision.
- Sécurisation des données sensibles via la technologie de registre distribué (Blockchain).

**Perspectives d'amélioration :**
1. **Deep Learning :** Explorer l'utilisation de réseaux de neurones récurrents (LSTM) pour analyser les séries temporelles sur de longues périodes.
2. **Edge Computing :** Déployer les modèles allégés (TinyML) directement sur les capteurs IoT pour réduire la bande passante réseau et le temps de latence.
3. **Application Mobile :** Développer une version mobile native pour les techniciens intervenant sur le terrain, incluant le support de la réalité augmentée (AR) pour localiser rapidement le composant défectueux.

---
*Ce rapport a été rédigé dans le cadre du Projet de Fin d'Études de l'année 2025/2026. La solution VibraGuard constitue une base solide pour le développement de futures applications industrielles intelligentes.*
