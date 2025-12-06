# UBA Multi-ML Models - Developer Guide

## Project Overview

**Goal:** Build a full-stack web application that connects machine learning models (Python) to a React frontend for analyzing security threats (SQL injection detection, etc.).

**Architecture:**
- **Frontend:** React 18 + Vite (JavaScript/JSX)
- **Backend:** FastAPI (Python) - REST API layer
- **ML Pipeline:** Python scripts + Jupyter notebooks for training
- **Models:** Scikit-learn models saved as `.joblib` files
- **Data Flow:** User uploads CSV → Backend runs ML pipeline → Returns alerts

---

## Project Structure

```
UBA/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── App.jsx             # Main app component, routing logic
│   │   ├── main.jsx            # Entry point
│   │   ├── components/         # UI components
│   │   │   ├── Dashboard.jsx   # Model selection, file upload, analysis
│   │   │   ├── Hero.jsx        # Landing page
│   │   │   ├── AlertList.jsx   # Alert display
│   │   │   ├── UserList.jsx    # User activity list
│   │   │   └── MiniChart.jsx   # Chart.js visualization
│   │   ├── services/
│   │   │   └── api.js          # API calls to backend
│   │   └── styles.css          # Global styles
│   ├── public/
│   │   └── assets/             # Static files (videos, images)
│   ├── vite.config.js          # Vite config (proxy, React plugin, aliases)
│   ├── package.json            # Dependencies
│   └── index.html              # HTML entry point
│
├── backend/                     # FastAPI REST API
│   ├── main.py                 # API endpoints (/api/models, /api/analyze, /api/alerts)
│   └── __init__.py
│
├── models/                      # Trained ML models
│   ├── registry.json           # Model metadata (name, path, features module)
│   └── sqli_detection_model.joblib  # Trained model artifact
│
├── src/                         # Shared feature engineering
│   └── features/
│       └── sql_injection.py    # Feature extraction for SQLi detection
│
├── training/                    # Jupyter notebooks for training
│   └── sql_injection_urls.ipynb
│
├── data/                        # Raw datasets
│   └── csic_database.csv
│
├── output/                      # Generated alerts
│   ├── alerts.csv
│   └── sqli_alerts.csv
│
├── pipeline.py                  # CLI inference script
├── requirements.txt             # Python dependencies
└── README.md
```

---

## How It Works

### 1. Model Training (Jupyter Notebook)

**File:** `training/sql_injection_urls.ipynb`

**Steps:**
1. Load raw CSV data
2. Import `extract_features()` from `src/features/sql_injection.py`
3. Train IsolationForest model
4. Fit StandardScaler
5. Save model dict to `.joblib`:
   ```python
   model_data = {
       'model': trained_model,
       'scaler': fitted_scaler,
       'feature_cols': ['has_sql_keyword', 'sql_keyword_count', ...],
       'model_type': 'sqli_detection'
   }
   joblib.dump(model_data, '../models/sqli_detection_model.joblib')
   ```

### 2. Model Registry

**File:** `models/registry.json`

Central metadata for all models:
```json
{
  "sqli_detection": {
    "id": "sqli_detection",
    "name": "SQL Injection Detection",
    "path": "models/sqli_detection_model.joblib",
    "features_module": "src.features.sql_injection",
    "description": "Detects SQL injection attacks in HTTP URLs",
    "input_format": "CSV with HTTP request logs",
    "output_type": "anomaly_detection"
  }
}
```

### 3. Backend API (FastAPI)

**File:** `backend/main.py`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/models` | List available models from registry |
| POST | `/api/analyze` | Run analysis on uploaded CSV |
| GET | `/api/alerts` | Get recent alerts from output/ |

**Request Flow (`/api/analyze`):**
1. Frontend uploads CSV + model ID
2. Backend saves file to temp location
3. Calls `run_prediction()` from `pipeline.py`
4. Pipeline loads model, extracts features, predicts
5. Backend cleans NaN/Inf values
6. Returns JSON: `{total_rows, total_alerts, alerts: [...]}`

### 4. Frontend (React)

**Entry:** `frontend/src/main.jsx` → `<App />` → `<Dashboard />`

**User Flow:**
1. User lands on **Hero** page (cybersecurity-themed landing)
2. Clicks "Dashboard" → sees model selector + file upload
3. Selects model from dropdown (fetched from `/api/models`)
4. Uploads CSV file
5. Clicks "Run analysis"
6. `Dashboard.jsx` calls `/api/analyze`
7. Results page shows:
   - Total rows processed
   - Total alerts found
   - Alert rate %
   - Sample alerts (URLs, flags)

**API Service (`frontend/src/services/api.js`):**
- Uses relative URLs (`/api/...`) so Vite proxy forwards to backend
- Error handling with try/catch, fallback to empty arrays

**Vite Proxy (`vite.config.js`):**
```js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```
Forwards `/api/*` requests to FastAPI backend during development.

---

## Setup & Running

### Prerequisites
- **Python 3.8+** (3.10 recommended)
- **Node.js 18+** and npm
- **Git**

### 1. Clone & Install Dependencies

```powershell
# Clone repo
git clone https://github.com/Mahmoud-Ossama/UBA_Multi_ML_Models.git
cd UBA_Multi_ML_Models

# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start Backend

```powershell
cd backend
python main.py
```
Backend runs on **http://127.0.0.1:8000**

### 3. Start Frontend

Open a new terminal:
```powershell
cd frontend
npm run dev
```
Frontend runs on **http://localhost:5173** (or 5174 if 5173 is busy)

### 4. Access Application

Open browser: **http://localhost:5173**

---

## Common Issues & Solutions

### Issue: Frontend shows blank page

**Cause:** React hook errors (duplicate React copies)

**Fix:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

Check `vite.config.js` has React aliases:
```js
resolve: {
  alias: {
    react: path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom')
  }
}
```

---

### Issue: CORS errors in browser console

**Cause:** Backend not running OR proxy misconfigured

**Fix:**
1. Ensure backend is running: `python backend/main.py`
2. Check `vite.config.js` proxy target matches backend host
3. Restart both frontend and backend

---

### Issue: `/api/alerts` returns 500 error

**Cause:** NaN or Inf values in CSV can't serialize to JSON

**Fix:** Backend now handles this automatically:
```python
df = df.replace([float('inf'), float('-inf')], None)
df = df.fillna(value=None)
```

---

### Issue: "ModuleNotFoundError: No module named 'src.features'"

**Cause:** Python path not set OR notebook directory changed

**Fix (Notebook):**
Update cell 2 in `training/*.ipynb`:
```python
import sys
from pathlib import Path

current_dir = Path.cwd()
for candidate in (current_dir, current_dir.parent):
    if (candidate / "src").exists():
        sys.path.insert(0, str(candidate.resolve()))
        break
```

**Fix (Pipeline):**
Ensure `pipeline.py` is run from repo root:
```powershell
cd D:\UBA\UBA
python pipeline.py --input data/csic_database.csv --model models/sqli_detection_model.joblib
```

---

### Issue: Vite proxy "ECONNREFUSED ::1:8000"

**Cause:** IPv6 vs IPv4 mismatch

**Fix:** Use `127.0.0.1` everywhere (not `localhost`):

`backend/main.py`:
```python
uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

`vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  }
}
```

---

## Adding a New Model

### Step 1: Create Feature Module

**File:** `src/features/your_model.py`

```python
import pandas as pd

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract features for your model."""
    df = df.copy()
    
    # Add your feature engineering logic
    df['feature_1'] = ...
    df['feature_2'] = ...
    
    return df
```

### Step 2: Train Model (Notebook)

**File:** `training/your_model.ipynb`

```python
# Cell 1: Imports
import sys, os
sys.path.insert(0, os.path.abspath('..'))
from src.features.your_model import extract_features
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Cell 2: Load & extract features
df = pd.read_csv('../data/your_data.csv')
df = extract_features(df)

# Cell 3: Train
feature_cols = ['feature_1', 'feature_2', ...]
X = df[feature_cols].fillna(0).values
scaler = StandardScaler().fit(X)
X_scaled = scaler.transform(X)

model = IsolationForest(contamination=0.02, random_state=42)
model.fit(X_scaled)

# Cell 4: Save
model_data = {
    'model': model,
    'scaler': scaler,
    'feature_cols': feature_cols,
    'model_type': 'your_model_id'
}
joblib.dump(model_data, '../models/your_model.joblib')
```

### Step 3: Register Model

**File:** `models/registry.json`

```json
{
  "sqli_detection": { ... },
  "your_model_id": {
    "id": "your_model_id",
    "name": "Your Model Name",
    "path": "models/your_model.joblib",
    "features_module": "src.features.your_model",
    "description": "What your model detects",
    "input_format": "CSV with ...",
    "output_type": "anomaly_detection"
  }
}
```

### Step 4: Update Pipeline Dispatch

**File:** `pipeline.py` (lines 66-74)

```python
if model_type == 'sqli_detection' or 'sql' in model_path.lower():
    from src.features.sql_injection import extract_features
elif model_type == 'your_model_id':
    from src.features.your_model import extract_features
else:
    print("Warning: Unknown model type, assuming features exist in CSV")
```

### Step 5: Test

Restart backend, refresh frontend. Your new model appears in the dropdown automatically!

---

## Development Workflow

### Daily Development

1. **Backend changes:** Auto-reloads with `reload=True`
2. **Frontend changes:** Vite hot-reloads automatically
3. **Model changes:** 
   - Train in notebook
   - Save to `models/`
   - Update `registry.json`
   - Restart backend

### Testing Full Pipeline

```powershell
# CLI test (no frontend)
python pipeline.py \
  --input data/csic_database.csv \
  --model models/sqli_detection_model.joblib \
  --output output/test_alerts.csv

# Check output
Get-Content output/test_alerts.csv | Select-Object -First 5
```

### Debugging

**Backend Logs:**
- Check terminal running `python main.py`
- FastAPI shows all requests + errors

**Frontend Logs:**
- Browser console (F12 → Console)
- Network tab (F12 → Network) to see API calls

**Model Issues:**
- Run notebook cells individually
- Check `feature_cols` match between training and pipeline

---

## API Reference

### GET /api/models

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sqli_detection",
      "name": "SQL Injection Detection",
      "description": "Detects SQL injection attacks in HTTP URLs",
      "input_format": "CSV with HTTP request logs",
      "output_type": "anomaly_detection"
    }
  ],
  "message": "Found 1 models",
  "timestamp": "2025-12-06T14:32:10.123456"
}
```

### POST /api/analyze

**Request:**
```
Content-Type: multipart/form-data

model_id: sqli_detection
file: <CSV file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model_id": "sqli_detection",
    "model_name": "SQL Injection Detection",
    "file_name": "csic_database.csv",
    "total_rows": 36000,
    "total_alerts": 720,
    "alerts": [
      {
        "url": "http://example.com/login?id=1' OR '1'='1",
        "is_anomaly": 1,
        "is_sqli_flag": 1,
        "final_alert": 1
      },
      ...
    ]
  },
  "message": "Analysis complete: 720 alerts found",
  "timestamp": "2025-12-06T14:35:22.987654"
}
```

### GET /api/alerts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "...",
      "timestamp": "...",
      "is_anomaly": 1,
      "final_alert": 1
    }
  ],
  "message": "Loaded 100 alerts from sqli_alerts.csv",
  "timestamp": "2025-12-06T14:40:00.000000"
}
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| | Vite 7 | Build tool, dev server |
| | Chart.js 4 | Visualizations |
| **Backend** | FastAPI | REST API framework |
| | Uvicorn | ASGI server |
| | Python 3.10 | Runtime |
| **ML** | Scikit-learn | Model training (IsolationForest) |
| | Pandas | Data manipulation |
| | Joblib | Model serialization |
| **Data** | CSV files | Raw logs, alerts |

---

## Project Timeline (Implemented Features)

✅ **Phase 1 - MVP (Completed)**
- [x] Model registry system
- [x] FastAPI backend with 3 endpoints
- [x] React frontend with Dashboard
- [x] File upload + analysis workflow
- [x] Real-time results display
- [x] Error handling (NaN/Inf, CORS, etc.)
- [x] Vite proxy configuration
- [x] SQLi detection model integration

🔄 **Phase 2 - Enhancements (Future)**
- [ ] JWT authentication
- [ ] User management
- [ ] PostgreSQL for alerts history
- [ ] Multiple model comparison view
- [ ] Model versioning
- [ ] Batch processing queue

🔮 **Phase 3 - Production (Future)**
- [ ] Redis caching
- [ ] Docker deployment
- [ ] Load balancing
- [ ] CI/CD pipeline
- [ ] Monitoring & logging

---

## Git Workflow

### Current State
- Branch: `main`
- Remote: `https://github.com/Mahmoud-Ossama/UBA_Multi_ML_Models.git`

### Commit Changes

```powershell
git add .
git commit -m "Add new model / Fix bug / Update docs"
git push origin main
```

### Important: `.gitignore` Configuration

**Tracked:**
- Source code (`*.py`, `*.jsx`, `*.js`)
- Configuration (`*.json`, `*.md`)
- Data files (`data/*.csv`) ✅ Fixed to allow data commits
- Models (`models/*.joblib`)

**Ignored:**
- `node_modules/`
- `__pycache__/`
- `output/*.csv` (generated alerts)
- `.venv/`
- `.vscode/`

---

## Key Lessons Learned

### 1. Import Path Management
- Notebooks need dynamic `sys.path` setup to find `src/`
- Use `Path.cwd()` to locate repo root
- Always import from repo root, not relative paths

### 2. React Duplicate Issue
- Multiple React copies cause "Invalid hook call"
- Solution: Vite aliases force single React instance
- Always use `path.resolve('./node_modules/react')`

### 3. JSON Serialization
- Pandas DataFrames can have NaN/Inf values
- FastAPI can't serialize these to JSON
- Always clean: `df.replace([inf, -inf], None).fillna(None)`

### 4. Proxy Configuration
- Use `127.0.0.1` not `localhost` (IPv6 issues)
- Vite proxy only works during dev (`npm run dev`)
- Production needs CORS headers on backend

### 5. Model Format Standardization
- All models must save as dict with specific keys
- `feature_cols` order matters (must match training)
- `model_type` drives feature extraction dispatch

---

## Contact & Support

**Developer:** Mahmoud Ossama  
**Repository:** https://github.com/Mahmoud-Ossama/UBA_Multi_ML_Models  
**Project Type:** University graduation project (Cognitive UBA)

---

## Quick Reference Commands

### Start Everything
```powershell
# Terminal 1 (Backend)
cd backend
python main.py

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

### CLI Pipeline Test
```powershell
python pipeline.py --input data/csic_database.csv --model models/sqli_detection_model.joblib
```

### Rebuild Frontend
```powershell
cd frontend
npm run build
npm run preview  # Test production build
```

### Check Logs
```powershell
# Backend logs
# (visible in terminal running python main.py)

# Frontend build output
cd frontend
npm run build

# Git status
git status
git log --oneline -5
```

---

**Last Updated:** December 6, 2025  
**Version:** 1.0.0 (Phase 1 Complete)
