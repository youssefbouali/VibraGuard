from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="VibraGuard ML Service")

class VibrationData(BaseModel):
    sensor_id: str
    amplitude: float
    frequency: float
    temperature: float

@app.get("/")
def read_root():
    return {"status": "ML Service Operational"}

@app.post("/predict")
def predict_anomaly(data: VibrationData):
    # Placeholder for model inference
    # In reality, load model from pickle/mlflow and predict
    is_anomaly = False # Mock result
    confidence = 0.95
    
    return {
        "sensor_id": data.sensor_id,
        "is_anomaly": is_anomaly,
        "confidence": confidence,
        "rul_prediction_days": 45
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
