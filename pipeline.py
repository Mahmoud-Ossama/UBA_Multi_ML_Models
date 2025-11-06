"""pipeline.py
Inference pipeline: load CSV → extract features → load model → predict → save alerts.
"""

import os
import pickle
import pandas as pd

try:
    import joblib
except Exception:
    joblib = None


def safe_load_model(path):
    """Try joblib then pickle. Return loaded model dict."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    
    if joblib and path.endswith(('.joblib', '.jl')):
        return joblib.load(path)
    try:
        return joblib.load(path) if joblib else pickle.load(open(path, 'rb'))
    except Exception:
        try:
            return pickle.load(open(path, 'rb'))
        except Exception as e:
            raise RuntimeError(f"Failed to load model from {path}: {e}")


def run_prediction(input_csv_path, model_path, output_path='output/alerts.csv'):
    """
    Run inference pipeline: extract features from raw CSV and predict alerts.
    
    Args:
        input_csv_path: Path to input CSV file
        model_path: Path to trained model (.pkl/.joblib)
        output_path: Path to save alerts
    
    Returns:
        DataFrame with predictions, alerts DataFrame
    """
    # Validate inputs
    if not os.path.exists(input_csv_path):
        raise FileNotFoundError(f"Input CSV not found: {input_csv_path}")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    print(f"Loading CSV: {input_csv_path}")
    df = pd.read_csv(input_csv_path, low_memory=False)
    
    print(f"Loading model from: {model_path}")
    model_data = safe_load_model(model_path)
    
    # Handle different model formats
    if isinstance(model_data, dict):
        model = model_data.get('model')
        scaler = model_data.get('scaler')
        feature_cols = model_data.get('feature_cols')
        model_type = model_data.get('model_type', 'unknown')
        
        if not model:
            raise ValueError("Model data does not contain 'model' key")
    else:
        raise ValueError("Model must be saved as a dictionary with 'model', 'scaler', and 'feature_cols' keys")
    
    # Extract features based on model type
    print(f"Extracting features for model type: {model_type}")
    
    if model_type == 'sqli_detection' or 'sql' in model_path.lower():
        # Import SQL injection feature extractor
        from src.features.sql_injection import extract_features
        df = extract_features(df)
    else:
        # Generic feature extraction - assumes features already exist
        print("Warning: Unknown model type, assuming features exist in CSV")
    
    # Prepare features
    if not all(col in df.columns for col in feature_cols):
        missing = [col for col in feature_cols if col not in df.columns]
        raise ValueError(f"Missing required feature columns: {missing}")
    
    X_raw = df[feature_cols].fillna(0).astype(float).values
    
    # Scale and predict
    if scaler:
        X = scaler.transform(X_raw)
    else:
        X = X_raw
    
    preds = model.predict(X)
    df['is_anomaly'] = (preds == -1).astype(int)
    
    # Filter alerts
    if 'is_sqli_flag' in df.columns:
        df['final_alert'] = ((df['is_sqli_flag'] == 1) | (df['is_anomaly'] == 1)).astype(int)
    else:
        df['final_alert'] = df['is_anomaly']
    
    alerts = df[df['final_alert'] == 1]
    
    # Save results
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    alerts.to_csv(output_path, index=False)
    
    print("=" * 40)
    print("PREDICTION SUMMARY")
    print(f"Input CSV: {input_csv_path}")
    print(f"Total rows: {len(df):,}")
    print(f"Total alerts: {len(alerts):,}")
    print(f"Saved alerts: {output_path}")
    print("=" * 40)
    
    return df, alerts


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generic Prediction Pipeline')
    parser.add_argument('--input', required=True, help='Path to input CSV file')
    parser.add_argument('--model', required=True, help='Path to trained model (.pkl/.joblib)')
    parser.add_argument('--output', default='output/alerts.csv', help='Output path for alerts')
    
    args = parser.parse_args()
    
    run_prediction(args.input, args.model, args.output)
