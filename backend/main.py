from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import datetime
import os

# 1. Initialize the API
app = FastAPI()

# 2. Enable CORS - Fixed Configuration
# We list specific origins instead of using "*" to avoid the security conflict
# with allow_credentials=True
origins = [
    "http://localhost:3000",
    "https://coffee-leaf-rust-detection.vercel.app", 
    "https://coffee-leaf-rust-detection-5be7dqmu8-nimlords-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Load your trained AI model
try:
    model = tf.keras.models.load_model("models/coffee_rust_model.h5")
    print("✅ Success: CoffeeDoc AI Model loaded into memory.")
except Exception as e:
    print(f"❌ Error: Could not load model. Details: {e}")

@app.get("/")
def check_status():
    return {"status": "CoffeeDoc National API is online"}

# 4. The Prediction Route
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image
    data = await file.read()
    image = Image.open(io.BytesIO(data)).convert("RGB")
    
    # Pre-processing
    img = image.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0).astype(np.float32)
    
    # Run Inference
    prediction_val = model.predict(img_array)[0][0]
    
    # --- LOGIC UPDATE: SEVERITY & ADVICE ---
    if prediction_val > 0.5:
        result = "Rust Detected"
        conf = float(prediction_val) * 100
        
        if prediction_val > 0.85:
            severity = "High (Critical)"
            advice = "EMERGENCY: Severe infection. Apply systemic fungicides (Cyproconazole) and prune immediately."
        elif prediction_val > 0.65:
            severity = "Moderate"
            advice = "ACTION: Apply copper-based fungicides (Nordox). Increase spacing for better airflow."
        else:
            severity = "Low (Early Stage)"
            advice = "MONITOR: Early spots detected. Remove affected leaves and ensure soil nutrition (Potassium)."
    else:
        result = "Healthy"
        conf = float(1 - prediction_val) * 100
        severity = "N/A"
        advice = "Leaf appears healthy. Maintain regular monitoring during the rainy season."
        
    return {
        "diagnosis": result,
        "confidence": round(conf, 2),
        "severity": severity,
        "advice": advice,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# 5. Execution Block
if __name__ == "__main__":
    import uvicorn
    # Get the port from the environment variable (Render sets this automatically)
    port = int(os.environ.get("PORT", 8000)) 
    uvicorn.run(app, host="0.0.0.0", port=port)