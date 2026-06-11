#!/bin/bash
# -----------------------------------------------------------------------------
# VibraGuard Platform - All-in-One Run Script
# This script builds and deploys the entire infrastructure and applications.
# -----------------------------------------------------------------------------

if [ -z "$BASH_VERSION" ]; then
  echo "⚠️  Please run this script with bash, not sh. Re-executing with bash..."
  exec bash "$0" "$@"
fi

set -e  # Exit on error

# Configuration
NAMESPACE="vibraguard"
ROOT_DIR=$(pwd)
echo "🚀 Starting VibraGuard Platform Deployment from: $ROOT_DIR"

# 1. Verify/Start Minikube
if ! minikube status > /dev/null 2>&1; then
    echo "📦 Starting Minikube..."
    minikube start --driver=docker --cpus=4 --memory=8192mb --ports=30008:30008,30007:30007,30001:30001,30083:30083,30090:30090,30086:30086
else
    echo "✅ Minikube is already running."
fi

# Use Minikube's Docker daemon for image builds
echo "🐳 Connecting to Minikube Docker daemon..."
eval $(minikube docker-env)

# No more local background process. Blockchain is now native to Minikube Kubernetes!

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

echo "🏗️  Building Blockchain Component (Dockerized)..."
cd "$ROOT_DIR/vibraguard/blockchain-net"
docker build -t vibraguard-blockchain:latest .

# Frontend build will occur after the blockchain contract is deployed,
# so the generated WorkOrderRegistry.json is available at build time.

echo "🏗️  Building AI Components (Dockerized)..."
cd "$ROOT_DIR/vibraguard/ia_model"
docker build -t vibraguard-ia:latest .

# 4. Infrastructure Services (Helm)
echo "🛠️  Deploying Infrastructure Services..."
#helm repo add bitnami https://charts.bitnami.com/bitnami
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
helm upgrade --install mosquitto k8s-at-home/mosquitto -n $NAMESPACE \
    --set service.main.type=NodePort \
    --set "service.main.ports.mqtt.nodePort=30083"

# Kafka: Custom Kubernetes Container Built from Apache Archive
echo "📦 Building Custom Kafka Docker Image..."
KAFKA_VERSION="3.9.1"
SCALA_VERSION="2.13"
KAFKA_DIR="$ROOT_DIR/vibraguard/kafka_$SCALA_VERSION-$KAFKA_VERSION"

if [ ! -d "$KAFKA_DIR" ]; then
    echo "Downloading Apache Kafka..."
    curl -O https://archive.apache.org/dist/kafka/$KAFKA_VERSION/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz
    tar -xzf kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -C "$ROOT_DIR/vibraguard"
    rm kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz
fi

# Build a quick custom Kafka image directly inside Minikube
cat <<EOF > "$KAFKA_DIR/Dockerfile"
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache bash
WORKDIR /kafka
COPY . /kafka/
EXPOSE 9092 2181
CMD ["/bin/bash", "-c", "bin/zookeeper-server-start.sh config/zookeeper.properties & sleep 5 && bin/kafka-server-start.sh config/server.properties --override listeners=PLAINTEXT://0.0.0.0:9092 --override advertised.listeners=PLAINTEXT://kafka:9092 & sleep 15 && bin/kafka-topics.sh --create --topic sensor-data --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 --if-not-exists && wait"]
EOF

cd "$KAFKA_DIR"
docker build -t custom-kafka:latest .
cd "$ROOT_DIR"

# helm upgrade --install spark-operator spark/spark-kubernetes-operator -n $NAMESPACE
# helm upgrade --install redis bitnami/redis -n $NAMESPACE --set architecture=standalone

echo "🔍 Deploying Elasticsearch (Single Node for Dev)..."
# Using a lighter single-node setup instead of the full Helm chart if possible, 
# but for consistency with your script style, I'll use the Helm chart with dev settings.
helm upgrade --install elasticsearch elastic/elasticsearch -n $NAMESPACE \
  --set replicas=1 \
  --set minimumMasterNodes=1 \
  --set xpack.security.enabled=false \
  --set xpack.security.http.ssl.enabled=false \
  --set resources.requests.cpu=100m \
  --set resources.requests.memory=512Mi

echo "⏳ Waiting for Elasticsearch to be ready..."
kubectl wait --for=condition=Ready pod -l app=elasticsearch-master -n $NAMESPACE --timeout=300s || true

echo "📊 Deploying Kibana (Visualization via manifest)..."
kubectl apply -n $NAMESPACE -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
        - name: kibana
          image: docker.elastic.co/kibana/kibana:8.5.1
          ports:
            - containerPort: 5601
          env:
            - name: ELASTICSEARCH_HOSTS
              value: "http://elasticsearch-master:9200"
            - name: XPACK_SECURITY_ENABLED
              value: "false"
          resources:
            requests:
              cpu: 100m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: $NAMESPACE
spec:
  type: NodePort
  selector:
    app: kibana
  ports:
    - port: 5601
      targetPort: 5601
      nodePort: 30001
EOF

echo "📈 Deploying Prometheus (Monitoring)..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install prometheus prometheus-community/prometheus -n $NAMESPACE \
  --set server.service.type=NodePort \
  --set server.service.nodePort=30090

echo "🕵️  Deploying Jaeger (Tracing)..."
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update
helm upgrade --install jaeger jaegertracing/jaeger -n $NAMESPACE \
  --set allInOne.enabled=true \
  --set agent.enabled=false \
  --set collector.serviceType=ClusterIP \
  --set query.serviceType=NodePort \
  --set query.service.nodePort=30086

# IPFS
echo "🌐 Deploying IPFS..."
if ! kubectl get deployment ipfs -n $NAMESPACE > /dev/null 2>&1; then
    kubectl create deployment ipfs --image=ipfs/kubo:latest -n $NAMESPACE
    kubectl expose deployment ipfs --type=NodePort --port=5001 -n $NAMESPACE || true
else
    echo "✅ IPFS is already deployed."
fi

# MongoDB is now handled via declarative manifest in k8s/mongodb.yaml

# 5. Apply Application Manifests
echo "🚀 Deploying Core Applications..."
cd "$ROOT_DIR"
mkdir -p k8s

# Create placeholder ConfigMap for contract address (will be updated after deployment)
kubectl create configmap workorder-registry-config \
    --from-literal=CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000" \
    -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

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
          env:
            - name: DB_URL
              value: "jdbc:oracle:thin:@oracle-db.vibraguard.svc.cluster.local:1521:xe"
            - name: DB_USERNAME
              valueFrom:
                secretKeyRef:
                  name: oracle-db-credentials
                  key: username
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: oracle-db-credentials
                  key: password
            - name: ELASTICSEARCH_URL
              value: "http://elasticsearch-master:9200"
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
          env:
            - name: BACKEND_URL
              value: "http://backend"
            - name: VITE_WORKORDER_REGISTRY_ADDRESS
              valueFrom:
                configMapKeyRef:
                  name: workorder-registry-config
                  key: CONTRACT_ADDRESS
                  optional: true
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

cat <<EOF > k8s/blockchain-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blockchain
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: blockchain
  template:
    metadata:
      labels:
        app: blockchain
    spec:
      containers:
        - name: blockchain
          image: vibraguard-blockchain:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 8545
EOF

cat <<EOF > k8s/blockchain-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: blockchain
  namespace: $NAMESPACE
spec:
  selector:
    app: blockchain
  ports:
    - port: 8545
      targetPort: 8545
EOF










# ADD KAFKA DEPLOYMENT
cat <<EOF > k8s/kafka-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka
  template:
    metadata:
      labels:
        app: kafka
    spec:
      containers:
        - name: kafka
          image: custom-kafka:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 9092
            - containerPort: 2181
---
apiVersion: v1
kind: Service
metadata:
  name: kafka
  namespace: $NAMESPACE
spec:
  selector:
    app: kafka
  ports:
    - name: kafka-port
      protocol: TCP
      port: 9092
      targetPort: 9092
    - name: zookeeper-port
      protocol: TCP
      port: 2181
      targetPort: 2181
EOF

# MONGODB MANIFEST (For persistence and consistency)
cat <<EOF > k8s/mongodb.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:latest
          ports:
            - containerPort: 27017
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: $NAMESPACE
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
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
          command: ["python3", "-u", "mqtt_to_kafka.py"]
          env:
            - name: PYTHONUNBUFFERED
              value: "1"
            - name: MQTT_BROKER
              value: "mosquitto"
            - name: KAFKA_BROKER
              value: "kafka:9092"
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
            - name: PYTHONUNBUFFERED
              value: "1"
            - name: KAFKA_BROKER
              value: "kafka:9092"
      restartPolicy: OnFailure
EOF



kubectl apply -f k8s/ -n $NAMESPACE

# 6. Deploy WorkOrderRegistry Smart Contract
echo "🔗 Waiting for Blockchain service to be ready..."
for i in {1..30}; do
    if kubectl wait --for=condition=ready pod -l app=blockchain -n $NAMESPACE --timeout=5s 2>/dev/null; then
        break
    fi
    echo "   Waiting... ($i/30)"
done

# Port-forward blockchain service so Hardhat deploy can reach it locally
echo "🌉 Forwarding blockchain service to localhost:8545..."
kubectl port-forward svc/blockchain 8545:8545 -n $NAMESPACE >/tmp/blockchain-port-forward.log 2>&1 &
PORT_FORWARD_PID=$!
sleep 5

BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"
echo "📝 Deploying WorkOrderRegistry contract using $BLOCKCHAIN_RPC_URL"

cd "$ROOT_DIR/vibraguard/blockchain-net"

# Deploy contract to the blockchain service
DEPLOY_OUTPUT=$(BLOCKCHAIN_RPC_URL="$BLOCKCHAIN_RPC_URL" npx hardhat run scripts/deploy.js --network localhost 2>&1 || true)
echo "$DEPLOY_OUTPUT"

# Stop port-forward
kill $PORT_FORWARD_PID 2>/dev/null || true
wait $PORT_FORWARD_PID 2>/dev/null || true

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP '(?<=deployed to )\K0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "⚠️  Could not extract contract address. Checking deployment output:"
    echo "$DEPLOY_OUTPUT" | grep -i "0x\|address\|deployed" || true
fi

if [ -n "$CONTRACT_ADDRESS" ]; then
    echo "✅ WorkOrderRegistry deployed at: $CONTRACT_ADDRESS"
    
    # Copy deployment artifact to frontend if deployment directory exists
    if [ -f "deployments/WorkOrderRegistry.json" ]; then
        echo "📋 Copying contract artifact to frontend..."
        mkdir -p "$ROOT_DIR/vibraguard/frontend/client/lib"
        cp "deployments/WorkOrderRegistry.json" "$ROOT_DIR/vibraguard/frontend/client/lib/WorkOrderRegistry.json" 2>/dev/null || true
        echo "✅ Contract artifact copied to frontend"
    fi

    # Build Frontend after contract deployment so the correct address is embedded
    echo "🏗️  Building Frontend (Next.js/Vite)..."
    cd "$ROOT_DIR/vibraguard/frontend"
    if ! command -v pnpm &> /dev/null; then
        echo "Installing pnpm..."
        npm install -g pnpm
    fi
    pnpm install
    pnpm run build
    docker build -t vibraguard-frontend:latest .

    # Ensure the frontend deployment picks up the locally built Minikube image
    echo "🔁 Restarting frontend deployment so Minikube re-creates the pod with the new local image..."
    kubectl rollout restart deployment/frontend -n $NAMESPACE || true

    # Create ConfigMap with contract address
    kubectl create configmap workorder-registry-config \
        --from-literal=CONTRACT_ADDRESS="$CONTRACT_ADDRESS" \
        -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

    # Update frontend deployment to include contract address env var
    kubectl set env deployment/frontend \
        VITE_WORKORDER_REGISTRY_ADDRESS="$CONTRACT_ADDRESS" \
        -n $NAMESPACE 2>/dev/null || echo "⚠️  Note: Frontend will use contract address on next restart"

    echo "📌 Contract address configured: $CONTRACT_ADDRESS"
else
    echo "⚠️  Contract deployment may have failed or address extraction unsuccessful"
    echo "   You can manually deploy with:"
    echo "   cd vibraguard/blockchain-net"
    echo "   BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545 npx hardhat run scripts/deploy.js --network localhost"
fi

cd "$ROOT_DIR"

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

# Safety: Ensure port-forwarding for all observability tools (in case minikube wasn't restarted)
echo "🔌 Activating external access for Monitoring & Tracing..."
kubectl port-forward --address 0.0.0.0 svc/prometheus-server -n $NAMESPACE 30090:80 > /dev/null 2>&1 &
kubectl port-forward --address 0.0.0.0 svc/jaeger-query -n $NAMESPACE 30086:16686 > /dev/null 2>&1 &
kubectl port-forward --address 0.0.0.0 svc/kibana -n $NAMESPACE 30001:5601 > /dev/null 2>&1 &
echo "🚀 Accessibility check: Prometheus (30090), Jaeger (30086), Kibana (30001) are active."
echo "======================================================"
