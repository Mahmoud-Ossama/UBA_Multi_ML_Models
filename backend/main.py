"""FastAPI Backend for UBA Multi-ML Models
Connects frontend to ML pipeline for real-time inference.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import tempfile
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add repo root to path so we can import pipeline
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline import run_prediction

app = FastAPI(title="UBA ML API", version="1.0.0")

# CORS - allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model registry
REGISTRY_PATH = Path(__file__).parent.parent / "models" / "registry.json"
MODEL_REGISTRY = {}

if REGISTRY_PATH.exists():
    with open(REGISTRY_PATH) as f:
        MODEL_REGISTRY = json.load(f)


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "success": True,
        "message": "UBA ML API is running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/models")
def list_models():
    """Return available ML models from registry"""
    models = [
        {
            "id": model_id,
            "name": meta["name"],
            "description": meta.get("description", ""),
            "input_format": meta.get("input_format", "CSV"),
            "output_type": meta.get("output_type", "anomaly_detection")
        }
        for model_id, meta in MODEL_REGISTRY.items()
    ]
    
    return {
        "success": True,
        "data": models,
        "message": f"Found {len(models)} models",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/analyze")
async def analyze(
    model_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Run ML analysis on uploaded file.
    
    Args:
        model_id: ID from model registry
        file: CSV file with raw logs
    
    Returns:
        JSON with analysis results and alerts
    """
    # Validate model
    if model_id not in MODEL_REGISTRY:
        raise HTTPException(status_code=400, detail=f"Unknown model: {model_id}")
    
    model_meta = MODEL_REGISTRY[model_id]
    model_path = Path(__file__).parent.parent / model_meta["path"]
    
    if not model_path.exists():
        raise HTTPException(
            status_code=500, 
            detail=f"Model file not found: {model_path}"
        )
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported"
        )
    
    # Save uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_input_path = tmp.name
    
    # Create temp output path
    tmp_output_path = tempfile.mktemp(suffix="_alerts.csv")
    
    try:
        # Run ML pipeline
        df_all, alerts_df = run_prediction(
            tmp_input_path,
            str(model_path),
            tmp_output_path
        )
        
        # Replace NaN and Inf values for JSON compatibility
        alerts_df = alerts_df.replace([float('inf'), float('-inf')], None)
        alerts_df = alerts_df.fillna(value=None)
        
        # Convert alerts to JSON
        alerts_list = alerts_df.head(100).to_dict(orient="records")
        
        # Clean up temp files
        os.unlink(tmp_input_path)
        if os.path.exists(tmp_output_path):
            os.unlink(tmp_output_path)
        
        return {
            "success": True,
            "data": {
                "model_id": model_id,
                "model_name": model_meta["name"],
                "file_name": file.filename,
                "total_rows": len(df_all),
                "total_alerts": len(alerts_df),
                "alerts": alerts_list
            },
            "message": f"Analysis complete: {len(alerts_df)} alerts found",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(tmp_input_path):
            os.unlink(tmp_input_path)
        if os.path.exists(tmp_output_path):
            os.unlink(tmp_output_path)
        
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/alerts")
def get_alerts(model_id: str = None, limit: int = 100):
    """
    Get recent alerts from output directory.
    
    Args:
        model_id: Optional filter by model type
        limit: Max number of alerts to return
    """
    import pandas as pd
    
    output_dir = Path(__file__).parent.parent / "output"
    
    if not output_dir.exists():
        return {
            "success": True,
            "data": [],
            "message": "No alerts directory found",
            "timestamp": datetime.now().isoformat()
        }
    
    # Find alert files
    alert_files = list(output_dir.glob("**/*.csv"))
    
    if not alert_files:
        return {
            "success": True,
            "data": [],
            "message": "No alert files found",
            "timestamp": datetime.now().isoformat()
        }
    
    # Load most recent file
    latest_file = max(alert_files, key=lambda p: p.stat().st_mtime)
    
    try:
        df = pd.read_csv(latest_file)
        
        # Replace NaN and Inf values with None for JSON compatibility
        df = df.replace([float('inf'), float('-inf')], None)
        df = df.fillna(value=None)
        
        alerts = df.head(limit).to_dict(orient="records")
        
        return {
            "success": True,
            "data": alerts,
            "message": f"Loaded {len(alerts)} alerts from {latest_file.name}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load alerts: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
