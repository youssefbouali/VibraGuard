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
cd "$ROOT_DIR/vibraguard/backend/vibraguard-parent"
# Use ./mvnw if available, otherwise fallback to mvn
if [ -f "./mvnw" ]; then
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

cd api-gateway
docker build -t vibraguard-backend:latest .

echo "🏗️  Building Frontend (Next.js/Vite)..."
cd "$ROOT_DIR/vibraguard/frontend/Vibraguard8"
# Ensure pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi
pnpm install
pnpm run build
docker build -t vibraguard-frontend:latest .

# 4. Infrastructure Services (Helm)
echo "🛠️  Deploying Infrastructure Services..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add elastic https://helm.elastic.co
helm repo add spark https://apache.github.io/spark-kubernetes-operator
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
helm upgrade --install kafka bitnami/kafka -n $NAMESPACE --set replicaCount=1
helm upgrade --install spark-operator spark/spark-kubernetes-operator -n $NAMESPACE
helm upgrade --install redis bitnami/redis -n $NAMESPACE --set architecture=standalone
helm upgrade --install elasticsearch elastic/elasticsearch -n $NAMESPACE --set replicas=1

# IPFS
if ! kubectl get deployment ipfs -n $NAMESPACE > /dev/null 2>&1; then
    echo "🌐 Deploying IPFS..."
    kubectl create deployment ipfs --image=ipfs/kubo:latest -n $NAMESPACE
    kubectl expose deployment ipfs --type=NodePort --port=5001 --target-port=5001 --node-port=30001 -n $NAMESPACE || true
fi

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
echo "IPFS API: http://$MINIKUBE_IP:$(kubectl get svc -n $NAMESPACE ipfs -o jsonpath='{.spec.ports[0].nodePort}')"
echo "======================================================"
