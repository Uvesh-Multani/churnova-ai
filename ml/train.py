import os
import json
import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.inspection import permutation_importance
import joblib

DB_PATH = "dev.db"
MODEL_DIR = "models"
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

def main():
    print("Connecting to database...")
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}. Run the dataset generation script first.")
        return

    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    
    query = """
    SELECT id, loginFrequency, avgSessionDuration, featureUsageRate, 
           anomalyScore, riskLevel, churnProbability
    FROM Customer
    """
    
    df = pd.read_sql_query(query, conn)
    conn.close()

    print(f"Loaded {len(df)} records from the database.")
    
    if len(df) == 0:
        print("Dataset is empty. Run npx tsx scripts/generate_dataset.ts first.")
        return

    os.makedirs(MODEL_DIR, exist_ok=True)

    metrics = {}

    # Define features
    feature_names = ['loginFrequency', 'avgSessionDuration', 'featureUsageRate']
    X = df[feature_names]
    
    # 0. Data Scaling
    print("Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))

    # 1. Isolation Forest for Anomaly Detection (Unsupervised)
    print("Training Isolation Forest for Anomaly Detection...")
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    iso_forest.fit(X_scaled)
    joblib.dump(iso_forest, os.path.join(MODEL_DIR, "isolation_forest.joblib"))
    metrics["anomaly"] = {"contamination": 0.1, "model": "IsolationForest"}
    
    # 2. HistGradientBoosting for Risk Level Classification (Supervised)
    print("Tuning & Training Gradient Boosting Classifier for Risk Level...")
    y_class = df['riskLevel']
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_scaled, y_class, test_size=0.2, random_state=42)
    
    param_grid_class = {
        'learning_rate': [0.05, 0.1],
        'max_iter': [100, 200],
        'max_depth': [3, 5, None]
    }
    
    gb_classifier = HistGradientBoostingClassifier(random_state=42)
    clf_search = GridSearchCV(gb_classifier, param_grid_class, cv=3, n_jobs=-1)
    clf_search.fit(X_train_c, y_train_c)
    
    best_clf = clf_search.best_estimator_
    y_pred_c = best_clf.predict(X_test_c)
    acc = accuracy_score(y_test_c, y_pred_c)
    print(f"   Best Classifier Params: {clf_search.best_params_}")
    print(f"   Risk Level Classifier Accuracy: {acc:.2%}")
    
    joblib.dump(best_clf, os.path.join(MODEL_DIR, "gb_classifier.joblib"))
    metrics["classification"] = {
        "accuracy": float(acc),
        "best_params": clf_search.best_params_,
        "model": "HistGradientBoostingClassifier"
    }

    # 3. HistGradientBoosting for Churn Probability Regression (Supervised)
    print("Tuning & Training Gradient Boosting Regressor for Churn Probability...")
    y_reg = df['churnProbability']
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_scaled, y_reg, test_size=0.2, random_state=42)
    
    param_grid_reg = {
        'learning_rate': [0.05, 0.1],
        'max_iter': [100, 200],
        'max_depth': [3, 5, None],
        'l2_regularization': [0.0, 0.1]
    }
    
    gb_regressor = HistGradientBoostingRegressor(random_state=42)
    reg_search = GridSearchCV(gb_regressor, param_grid_reg, cv=3, n_jobs=-1)
    reg_search.fit(X_train_r, y_train_r)
    
    best_reg = reg_search.best_estimator_
    y_pred_r = best_reg.predict(X_test_r)
    mae = mean_absolute_error(y_test_r, y_pred_r)
    print(f"   Best Regressor Params: {reg_search.best_params_}")
    print(f"   Churn Regressor Mean Absolute Error: {mae:.2f}%")
    
    # Calculate Feature Importance for Explainability later
    print("Calculating Global Feature Importance...")
    r = permutation_importance(best_reg, X_test_r, y_test_r, n_repeats=10, random_state=42)
    importance_map = {feature_names[i]: float(r.importances_mean[i]) for i in range(len(feature_names))}
    
    joblib.dump(best_reg, os.path.join(MODEL_DIR, "gb_regressor.joblib"))
    
    # Save Feature Importance to use in prediction
    with open(os.path.join(MODEL_DIR, "feature_importance.json"), "w") as f:
        json.dump(importance_map, f)

    metrics["regression"] = {
        "mae": float(mae),
        "best_params": reg_search.best_params_,
        "model": "HistGradientBoostingRegressor",
        "feature_importance": importance_map
    }

    # Write metrics to JSON file for frontend consumption
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=4)

    print(f"Models and metrics successfully trained and serialized to {MODEL_DIR}/ directory.")

if __name__ == "__main__":
    main()

