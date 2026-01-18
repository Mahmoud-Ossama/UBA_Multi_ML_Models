<<<<<<< HEAD
# UBA Frontend (simple React + Vite)

This is a minimal frontend prototype for the Cognitive UBA project. It uses Vite + React and a mock API for development.

Quick start (Windows PowerShell):

```powershell
cd "f:\Graduation projet\Graduation project_front"
npm install
npm run dev
```

The app shows a simple home hero page and a dashboard with users, alerts, search/filter and a small trend chart.
=======
# ML Model Training & Prediction Pipeline

Modular framework for training and deploying ML models. Feature engineering is shared between training and inference to ensure consistency.

## Structure

```
├── src/
│   └── features/         # Shared feature engineering modules
├── training/             # Jupyter notebooks for model training
├── models/              # Saved model artifacts (.joblib)
├── data/               # Raw input datasets
├── output/             # Prediction results
├── testing/            # Unit tests (future)
└── pipeline.py         # CLI entry point for inference
```

## Workflow

1. **Train**: Open notebook in `training/` → import features from `src/` → train model → save to `models/`
2. **Predict**: Run `pipeline.py` → load CSV → extract features using `src/` → load model → save alerts

## Setup

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Usage

### Train a Model

1. Open `training/sql_injection_urls.ipynb`
2. Run all cells to:
   - Import shared feature extraction from `src/features/sql_injection.py`
   - Extract features and train Isolation Forest
   - Save model to `models/sqli_detection_model.joblib`

### Run Predictions

```powershell
python pipeline.py --input "data/your_data.csv" --model "models/sqli_detection_model.joblib" --output "output/alerts.csv"
```

The pipeline automatically:
- Detects model type from filename or metadata
- Applies the correct feature extraction
- Loads the trained model
- Generates and saves alerts

## Current Models

### SQL Injection Detection
- **Features**: `src/features/sql_injection.py`
- **Training**: `training/sql_injection_urls.ipynb`
- **Model**: `models/sqli_detection_model.joblib`
- **Input**: CSV with HTTP logs (auto-detects URL/timestamp/user columns)
- **Output**: CSV with SQLi alerts

## Adding New Models

1. Create feature module in `src/features/your_model.py`
2. Create training notebook in `training/your_model.ipynb` that imports the feature module
3. Train and save model dict: `{'model': model, 'scaler': scaler, 'feature_cols': [...], 'model_type': 'your_model'}`
4. Update `pipeline.py` to recognize your model type and apply features
5. Run predictions with `pipeline.py`

## Notes

⚠️ Only load models from trusted sources (pickle vulnerability)
>>>>>>> fe1aa6ea661542cf71d1ac0a66dca6b66ad282d8
