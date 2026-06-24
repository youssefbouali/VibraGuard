import asyncio
import time
import json
import statistics
import os
from gmqtt import Client as MQTTClient

# Configuration
BROKER = "localhost"
PORT = 30083
NUM_CLIENTS = 10000
TOPIC = "vibraguard/sensors"
MQTT_USER = os.getenv("MQTT_USER", "vibraguard")
MQTT_PASS = os.getenv("MQTT_PASS", "VibraGuard2024!")

# Metrics storage
latencies = []
messages_sent = 0
start_time = time.time()

async def sensor_task(client_id):
    global messages_sent
    client = MQTTClient(client_id)
    client.set_auth_credentials(MQTT_USER, MQTT_PASS)
    await client.connect(BROKER, PORT)
    
    # Simulate a single burst
    payload = json.dumps({"motor_id": client_id, "status": "normal", "temp": 25.0})
    
    start_send = time.perf_counter()
    client.publish(TOPIC, payload)
    end_send = time.perf_counter()
    
    latencies.append((end_send - start_send) * 1000) # ms
    messages_sent += 1
    
    await client.disconnect()

async def run_load_test():
    print(f"🚀 Starting load test with {NUM_CLIENTS} sensors...")
    
    # Create tasks for all clients
    tasks = [sensor_task(f"sensor_{i}") for i in range(NUM_CLIENTS)]
    
    test_start = time.time()
    await asyncio.gather(*tasks)
    test_end = time.time()
    
    # Calculate metrics
    duration = test_end - test_start
    p95 = statistics.quantiles(latencies, n=20)[18] # 95th percentile
    throughput = messages_sent / duration
    
    print("\n" + "="*30)
    print(f"📊 RESULTS")
    print(f"="*30)
    print(f"Latence P95: {p95:.2f} ms")
    print(f"Débit de traitement: {throughput:.2f} messages/s")
    print(f"Total messages: {messages_sent}")
    print(f"="*30)

if __name__ == "__main__":
    asyncio.run(run_load_test())