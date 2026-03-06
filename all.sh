#!/bin/bash

set -e  # Stop on error

#sudo apt update
#sudo apt install docker.io -y && sudo apt install docker-compose -y
#sudo usermod -aG docker $USER && newgrp docker

mkdir -p VibraGuard2
cd VibraGuard2
git init
BASE_DIR=$(pwd)


#git add .
#git commit -m "Initialisation structure projet"
#git remote add origin <url-repo>
#git push -u origin main




# Installer Minikube (une seule fois)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
#
## Installer kubectl si besoin
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/



# Étape 1: Démarrer Minikube (cluster from scratch)
echo "Démarrage de Minikube..."
minikube start --driver=docker --cpus=4 --memory=8192mb --ports=30008:30008,30007:30007,30001:30001  # Ajuste selon ta machine

# Démarrer Minikube (avec Docker comme driver)
#minikube start --driver=docker --cpus=2 --memory=4096mb
# (ajuste cpus/memory selon ta machine)

# Vérifier
kubectl get nodes
minikube status





# Étape 2: Installer Helm (si pas installé)
if ! command -v helm &> /dev/null; then
    echo "Installation de Helm..."
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
    chmod 700 get_helm.sh
    ./get_helm.sh
    rm get_helm.sh
fi

# Étape 3: Créer namespace
kubectl create namespace vibraguard || true

# Étape 4: Ajouter les repositories Helm
echo "Ajout des repositories Helm..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add elastic https://helm.elastic.co
helm repo add stackable-stable https://repo.stackable.tech/repository/helm-stable/
helm repo add spark https://apache.github.io/spark-kubernetes-operator
#helm repo add truecharts https://charts.truecharts.org
helm repo add k8s-at-home https://k8s-at-home.com/charts/
#helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
#helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
#helm repo add jenkins https://charts.jenkins.io
#helm repo add sonarsource https://SonarSource.github.io/helm-chart-sonarqube
helm repo update

# Étape 5: Déployer les charts











PROJECT_NAME="vibraguard"
GROUP_ID="com.vibraguard"
VERSION="0.0.1-SNAPSHOT"
SPRING_BOOT_VERSION="3.3.4"

echo "Initialisation du projet ${PROJECT_NAME} : Spring Boot + Next.js + Helm (version manuelle fiable)"

# Nettoyage préalable si tu veux repartir propre (commente si tu veux garder)
# rm -rf ${PROJECT_NAME}

mkdir -p ${PROJECT_NAME}/backend
#mkdir -p ${PROJECT_NAME}/frontend
mkdir -p ${PROJECT_NAME}/helm-charts
cd ${PROJECT_NAME}
PROJECT_ROOT=$(pwd)

# Backend Spring Boot - création manuelle
echo "→ Création backend Spring Boot (manuel, sans archetype)"
cd backend

PARENT_DIR="${PROJECT_NAME}-parent"
mkdir -p "${PARENT_DIR}"
cd "${PARENT_DIR}"

# Parent POM
cat << 'EOF' > pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.vibraguard</groupId>
    <artifactId>vibraguard-parent</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>api-gateway</module>
    </modules>

    <properties>
        <java.version>17</java.version>
        <spring-boot.version>3.3.4</spring-boot.version>
        <spring-cloud.version>2023.0.3</spring-cloud.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
EOF

# Module api-gateway
mkdir -p api-gateway/src/main/java/com/vibraguard/gateway
cd api-gateway

cat << 'EOF' > pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.vibraguard</groupId>
        <artifactId>vibraguard-parent</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>api-gateway</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
    </dependencies>

    <build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
</project>
EOF

# Classe principale Spring Boot
cat << 'EOF' > src/main/java/com/vibraguard/gateway/ApiGatewayApplication.java
package com.vibraguard.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
EOF

# Dockerfile
cat << 'EOF' > Dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
EOF

# Build depuis le dossier parent
cd ..
echo "Build du backend (depuis vibraguard-parent)..."
sudo apt install maven -y
mvn clean install || { echo "Build échoué - vérifie les logs ci-dessus"; exit 1; }

echo "Backend créé et buildé avec succès !"

cd ../../

# Frontend Next.js
#echo "→ Création frontend Next.js"
#cd frontend || exit 1
#
##curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
##sudo apt install -y nodejs
##sudo apt install npm -y
#
#npx create-next-app@latest web \
#  --typescript \
#  --tailwind \
#  --eslint \
#  --app \
#  --src-dir \
#  --import-alias "@/*" \
#  --use-npm \
#  --yes
#
#cd web
#npm install @reduxjs/toolkit react-redux
#
#mkdir -p src/store 
#mkdir -p src/slices 
#mkdir -p src/components
#
#cat << 'EOF' > src/store/store.ts
#import { configureStore } from '@reduxjs/toolkit'
#
#export const store = configureStore({
#  reducer: {},
#})
#
#export type RootState = ReturnType<typeof store.getState>
#export type AppDispatch = typeof store.dispatch
#EOF
#
#
## Dockerfile Next.js
#cat << 'EOF' > Dockerfile
#FROM node:20-alpine AS base
#
#FROM base AS deps
#WORKDIR /app
#COPY package.json package-lock.json* ./
#RUN npm ci
#
#FROM base AS builder
#WORKDIR /app
#COPY --from=deps /app/node_modules ./node_modules
#COPY . .
#RUN npm run build
#
#FROM base AS runner
#WORKDIR /app
#ENV NODE_ENV=production
#COPY --from=builder /app/package.json ./
#COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
#COPY --from=builder /app/node_modules ./node_modules
#EXPOSE 3000
#CMD ["npm", "start"]
#EOF
#
#cd ../../

# Helm chart


# 1. Télécharger le script d'installation officiel de Helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

# 2. Rendre le script exécutable
chmod 700 get_helm.sh

# 3. Lancer l'installation (il va installer Helm dans /usr/local/bin/helm)
./get_helm.sh

# 4. Vérifier que Helm est bien installé
helm version



echo "→ Création chart Helm"
cd helm-charts || exit 1
helm create ${PROJECT_NAME}
cd ${PROJECT_NAME}
rm -rf templates/*

helm create backend
helm create frontend

cat << 'EOF' > Chart.yaml
apiVersion: v2
name: vibraguard
description: VibraGuard - Smart Factory Platform
type: application
version: 0.1.0
dependencies:
  - name: backend
    version: "0.1.0"
    repository: "file://backend"
  - name: frontend
    version: "0.1.0"
    repository: "file://frontend"
EOF

cat << 'EOF' > values.yaml
backend:
  enabled: true
  image:
    repository: your-registry/vibraguard-gateway
    tag: latest
frontend:
  enabled: true
  image:
    repository: your-registry/vibraguard-web
    tag: latest
EOF

echo "Projet créé avec succès !"
#tree -L 3 ..

echo ""
echo "Étapes suivantes :"
echo "1. cd backend/api-gateway && mvn spring-boot:run   # pour tester le gateway"
echo "2. cd ../../../frontend/web && npm run dev"
echo "3. cd ../../helm-charts/vibraguard && helm dependency build"


echo "======================================================"
echo "Build Docker images inside Minikube"
echo "======================================================"

# Use Minikube Docker
eval $(minikube docker-env)

# ---------------- BUILD ----------------
# Use PROJECT_ROOT (VibraGuard2/vibraguard) captured earlier
echo "Project Root: $PROJECT_ROOT"

# ---------------- BACKEND ----------------
echo "Build backend image..."
cd "$PROJECT_ROOT/backend/api-gateway"

mvn clean package -DskipTests

docker build -t vibraguard-backend:latest .

# ---------------- FRONTEND ----------------
echo "Build frontend image..."
cd "$PROJECT_ROOT/frontend"

npm install -g pnpm
pnpm install
pnpm run build

docker build -t vibraguard-frontend:latest .

# ---------------- K8S FILES ----------------
echo "Create Kubernetes manifests..."
cd "$PROJECT_ROOT"
mkdir -p k8s
cd k8s

# BACKEND DEPLOYMENT
cat <<EOF > backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: vibraguard
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: vibraguard-backend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 8080
EOF

# BACKEND SERVICE
cat <<EOF > backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: vibraguard
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30007
EOF

# FRONTEND DEPLOYMENT
cat <<EOF > frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: vibraguard
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: vibraguard-frontend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
EOF

# FRONTEND SERVICE
cat <<EOF > frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: vibraguard
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30008
EOF

# ---------------- DEPLOY ----------------
echo "Deploy to Kubernetes..."
kubectl apply -f .

# ---------------- STATUS ----------------
echo "======================================================"
echo "Deployment status"
echo "======================================================"

kubectl get pods -n vibraguard
kubectl get svc -n vibraguard

echo ""
echo "Access URLs:"
MINIKUBE_IP=$(minikube ip)
echo "Frontend: http://$MINIKUBE_IP:30008"
echo "Backend : http://$MINIKUBE_IP:30007"








# Oracle Database (clone repo Oracle pour chart custom)
echo "Déploiement d'Oracle DB..."
#rm -rf /tmp/oracle-docker
#git clone https://github.com/oracle/docker-images.git /tmp/oracle-docker || true
#cd /tmp/oracle-docker/OracleDatabase/SingleInstance/helm-charts/oracle-db
#helm install oracle-db . -n vibraguard --set image.tag=21.3.0-xe  # Accepte les termes Oracle ; ajuste PDB/SID

kubectl run oracle-db \
  --image=gvenzl/oracle-xe:21-slim \
  -n vibraguard \
  --env="ORACLE_PASSWORD=MyStrongPassword123" \
  --port=1521

kubectl expose pod oracle-db \
  --type=NodePort \
  --port=1521 \
  -n vibraguard

# Mosquitto (MQTT)
echo "Déploiement de Mosquitto..."
helm install mosquitto k8s-at-home/mosquitto -n vibraguard

# Kafka
echo "Déploiement de Kafka..."
helm install kafka bitnami/kafka -n vibraguard --set replicaCount=1  # Minimal, sans Zookeeper pour dev

# Spark Operator (pour Spark Streaming/PySpark)
echo "Déploiement de Spark Operator..."
helm install spark-operator spark/spark-kubernetes-operator -n vibraguard

# HDFS (via Stackable Hadoop)
#echo "Déploiement de HDFS Operator..."
#helm install hdfs-operator stackable-stable/hdfs-operator -n vibraguard
## Puis applique un CRD basique pour HDFS cluster (exemple minimal)
#cat <<EOF | kubectl apply -f - -n vibraguard
#apiVersion: hdfs.stackable.tech/v1alpha1
#kind: HdfsCluster
#metadata:
#  name: simple-hdfs
#spec:
#  image:
#    productVersion: "3.4.0"
#  clusterConfig:
#    zookeeperConfigMapName: simple-zk
#  nameNodes:
#    config: {}
#    roleGroups:
#      default:
#        replicas: 2
#  dataNodes:
#    config: {}
#    roleGroups:
#      default:
#        replicas: 3
#  journalNodes:
#    config: {}
#    roleGroups:
#      default:
#        replicas: 3
#EOF

# Redis
echo "Déploiement de Redis..."
helm install redis bitnami/redis -n vibraguard --set architecture=standalone  # Standalone pour dev

# IPFS
echo "Déploiement d'IPFS..."
#helm install ipfs truecharts/ipfs -n vibraguard

kubectl create deployment ipfs \
  --image=ipfs/kubo:latest \
  -n vibraguard

kubectl expose deployment ipfs \
  --type=NodePort \
  --port=5001 \
  -n vibraguard



# Elasticsearch
echo "Déploiement d'Elasticsearch..."
helm install elasticsearch elastic/elasticsearch -n vibraguard --set replicas=1

# Kibana (lié à Elasticsearch)
#echo "Déploiement de Kibana..."
#helm install kibana elastic/kibana -n vibraguard --set elasticsearchHosts="http://elasticsearch-master:9200"

# Prometheus
#echo "Déploiement de Prometheus..."
#helm install prometheus prometheus-community/prometheus -n vibraguard

# Jaeger
#echo "Déploiement de Jaeger..."
#helm install jaeger jaegertracing/jaeger -n vibraguard --set "allInOne.enabled=true"  # All-in-one pour dev

# Jenkins
#echo "Déploiement de Jenkins..."
#helm install jenkins jenkins/jenkins -n vibraguard

# Sonarqube
#echo "Déploiement de Sonarqube..."
#helm install sonarqube sonarsource/sonarqube -n vibraguard

# Flutter

echo "Déploiement terminé ! Vérifie avec 'kubectl get all -n vibraguard'"
echo "Pour accéder, utilise 'minikube service <service-name> -n vibraguard'"
echo "Adapte les values.yaml pour prod (ex. : persistence avec PV, secrets)."