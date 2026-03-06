#!/bin/bash
# -----------------------------------------------------------------------------
# VibraGuard Platform - All-in-One Run Script
# This script builds and deploys the entire infrastructure and applications.
# -----------------------------------------------------------------------------

set -e  # Exit on error

# Configuration
NAMESPACE="vibraguard"
ROOT_DIR=$(pwd)
echo "🚀 Starting VibraGuard Platform Deployment from: $ROOT_DIR"

# 1. Verify/Start Minikube
if ! minikube status > /dev/null 2>&1; then
    echo "📦 Starting Minikube..."
    minikube start --driver=docker --cpus=4 --memory=8192mb --ports=30008:30008,30007:30007,30001:30001
else
    echo "✅ Minikube is already running."
fi

# Use Minikube's Docker daemon for image builds
echo "🐳 Connecting to Minikube Docker daemon..."
eval $(minikube docker-env)

# 2. Kubernetes Namespace Setup
echo "☸️ Ensuring namespace '$NAMESPACE' exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 3. Component Builds
echo "🏗️  Building Backend (Spring Boot)..."
cd "$ROOT_DIR/vibraguard/backend"
# Use ./mvnw if available, otherwise fallback to mvn
if [ -f "./mvnw" ]; then
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

cd api-gateway
docker build -t vibraguard-backend:latest .

echo "🏗️  Building Frontend (Next.js/Vite)..."
cd "$ROOT_DIR/vibraguard/frontend"
# Ensure pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi
pnpm install
pnpm run build
docker build -t vibraguard-frontend:latest .

echo "🏗️  Building AI Components (Dockerized)..."
cd "$ROOT_DIR/vibraguard/ia_model"
docker build -t vibraguard-ia:latest .



# 4. Infrastructure Services (Helm)
echo "🛠️  Deploying Infrastructure Services..."
helm repo add bitnami https://charts.bitnami.com/bitnami
#helm repo add elastic https://helm.elastic.co
#helm repo add spark https://apache.github.io/spark-kubernetes-operator
helm repo add k8s-at-home https://k8s-at-home.com/charts/
helm repo update

# Oracle Database
echo "🗄️  Deploying Oracle DB..."
# Check if pod exists to avoid errors on 'run'
if ! kubectl get pod oracle-db -n $NAMESPACE > /dev/null 2>&1; then
    kubectl run oracle-db --image=gvenzl/oracle-xe:21-slim -n $NAMESPACE \
        --env="ORACLE_PASSWORD=MyStrongPassword123" --port=1521
    kubectl expose pod oracle-db --type=NodePort --port=1521 -n $NAMESPACE || true
else
    echo "✅ Oracle DB is already running."
fi

# Distributed Services
helm upgrade --install mosquitto k8s-at-home/mosquitto -n $NAMESPACE

# Kafka: Installing Outside Docker (Locally on Host)
echo "📦 Installing Kafka Locallly (Outside Docker)..."
KAFKA_VERSION="3.9.0"
SCALA_VERSION="2.13"
KAFKA_DIR="$ROOT_DIR/vibraguard/kafka_$SCALA_VERSION-$KAFKA_VERSION"

if [ ! -d "$KAFKA_DIR" ]; then
    echo "Downloading Apache Kafka..."
    curl -O https://downloads.apache.org/kafka/$KAFKA_VERSION/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz
    tar -xzf kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -C "$ROOT_DIR/vibraguard"
    rm kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz
fi

echo "Starting Local Zookeeper..."
# Use relative paths or absolute paths for Windows/Git Bash depending on environment
# Running in background:
# Note: On native Windows you might need .\bin\windows\zookeeper-server-start.bat instead.
if [ -f "$KAFKA_DIR/bin/zookeeper-server-start.sh" ]; then
    "$KAFKA_DIR/bin/zookeeper-server-start.sh" -daemon "$KAFKA_DIR/config/zookeeper.properties"
    sleep 5
    echo "Starting Local Kafka Server..."
    "$KAFKA_DIR/bin/kafka-server-start.sh" -daemon "$KAFKA_DIR/config/server.properties"
else
    # Fallback to windows batch if running in native windows terminal
    cmd.exe /c "start /b $KAFKA_DIR\bin\windows\zookeeper-server-start.bat $KAFKA_DIR\config\zookeeper.properties"
    sleep 5
    cmd.exe /c "start /b $KAFKA_DIR\bin\windows\kafka-server-start.bat $KAFKA_DIR\config\server.properties"
fi
echo "✅ Local Kafka is starting on port 9092..."

#helm upgrade --install kafka bitnami/kafka -n $NAMESPACE --version 29.3.4 --set replicaCount=1
#helm upgrade --install spark-operator spark/spark-kubernetes-operator -n $NAMESPACE
#helm upgrade --install redis bitnami/redis -n $NAMESPACE --set architecture=standalone
#helm upgrade --install elasticsearch elastic/elasticsearch -n $NAMESPACE --set replicas=1
# IPFS
#if ! kubectl get deployment ipfs -n $NAMESPACE > /dev/#null 2>&1; then
#    echo "🌐 Deploying IPFS..."
#    kubectl create deployment ipfs --image=ipfs/#kubo:latest -n $NAMESPACE
#    kubectl expose deployment ipfs --type=NodePort #--port=5001 --target-port=5001 --node-port=30001 -n #$NAMESPACE || true
#fi

# 5. Apply Application Manifests
echo "🚀 Deploying Core Applications..."
cd "$ROOT_DIR"
mkdir -p k8s

# Generate/Update manifests (kept for portability matching your all.sh logic)
cat <<EOF > k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: $NAMESPACE
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

cat <<EOF > k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: $NAMESPACE
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30007
EOF

cat <<EOF > k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: $NAMESPACE
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

cat <<EOF > k8s/frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: $NAMESPACE
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30008
EOF













# AI PIPELINE MANIFESTS
echo "🧠 Deploying AI Pipeline (Bridge & Spark Streaming)..."
cat <<EOF > k8s/ai-pipeline.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mqtt-kafka-bridge
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mqtt-bridge
  template:
    metadata:
      labels:
        app: mqtt-bridge
    spec:
      containers:
        - name: bridge
          image: vibraguard-ia:latest
          imagePullPolicy: Never
          command: ["python3", "mqtt_to_kafka.py"]
          env:
            - name: MQTT_BROKER
              value: "mosquitto"
            - name: KAFKA_BROKER
              value: "host.minikube.internal:9092"
---
apiVersion: batch/v1
kind: Job
metadata:
  name: spark-ai-processor
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
        - name: spark-processor
          image: vibraguard-ia:latest
          imagePullPolicy: Never
          command: ["spark-submit"]
          args: [
            "--packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0",
            "spark_streaming_process.py"
          ]
          env:
            - name: KAFKA_BROKER
              value: "host.minikube.internal:9092"
      restartPolicy: OnFailure
EOF



kubectl apply -f k8s/ -n $NAMESPACE

# 6. Status Summary
echo "======================================================"
echo "✨ VibraGuard Platform is now running!"
echo "======================================================"
kubectl get pods -n $NAMESPACE
kubectl get svc -n $NAMESPACE

MINIKUBE_IP=$(minikube ip)
echo ""
echo "Access points:"
echo "Frontend: http://$MINIKUBE_IP:30008"
echo "Backend:  http://$MINIKUBE_IP:30007"
#echo "IPFS API: http://$MINIKUBE_IP:$(kubectl get svc -n $NAMESPACE ipfs -o jsonpath='{.spec.ports[0].nodePort}')"
echo "======================================================"
