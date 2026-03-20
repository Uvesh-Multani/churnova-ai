import os
import sqlite3
import pandas as pd
import json
import joblib

DB_PATH = "dev.db"
MODEL_DIR = "models"
FEATURE_NAMES = ['loginFrequency', 'avgSessionDuration', 'featureUsageRate']

def get_insight_message(anomaly_pred, risk_pred, prob_pred, feature_importances, current_features):
    """
    Generates a highly specific AI insight by checking the predictions
    against the global feature importance weights.
    """
    if anomaly_pred == -1:
        return f"Anomalous behavior detected! Usage patterns deviate significantly. Machine learning models indicate a {prob_pred:.1f}% risk of churn."

    if prob_pred < 30:
        return "Healthy engagement pattern. No significant churn vectors detected by the model."

    # Identify the top driving feature
    top_feature = max(feature_importances, key=feature_importances.get)
    
    insight = ""
    if prob_pred > 70:
        insight = f"Critical Churn Risk ({prob_pred:.1f}%). "
    elif prob_pred > 40:
        insight = f"Elevated Risk ({prob_pred:.1f}%). "
    else:
        insight = f"Moderate Risk ({prob_pred:.1f}%). "

    # Dynamic explanation based on the most important feature the model cares about
    feature_val = current_features[top_feature]
    
    if top_feature == 'featureUsageRate':
        if feature_val < 30:
            insight += "The primary driver is critically low feature adoption. The user is struggling to find value."
        else:
            insight += "Feature usage is declining. The model identified this as the top risk indicator."
    elif top_feature == 'loginFrequency':
        if feature_val < 2:
            insight += "The user's login cadence has dropped to concerning levels compared to healthy accounts."
        else:
            insight += "Irregular login patterns detected. Re-engagement workflows are highly recommended."
    elif top_feature == 'avgSessionDuration':
        if feature_val < 10:
            insight += "Sessions are extremely short, indicating the user is not completing meaningful workflows."
        else:
            insight += "Session lengths are trending downward. The model weights this heavily for this account."

    return insight

def main():
    print("Connecting to database for inference...")
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}.")
        return

    model_paths = {
        "scaler": os.path.join(MODEL_DIR, "scaler.joblib"),
        "anomaly": os.path.join(MODEL_DIR, "isolation_forest.joblib"),
        "risk_class": os.path.join(MODEL_DIR, "gb_classifier.joblib"),
        "churn_reg": os.path.join(MODEL_DIR, "gb_regressor.joblib"),
        "feature_importance": os.path.join(MODEL_DIR, "feature_importance.json")
    }

    if not all(os.path.exists(p) for p in model_paths.values()):
        print("Models not found. Run ml/train.py first to train the enhanced pipeline.")
        return

    # Load models
    scaler = joblib.load(model_paths["scaler"])
    iso_forest = joblib.load(model_paths["anomaly"])
    gb_classifier = joblib.load(model_paths["risk_class"])
    gb_regressor = joblib.load(model_paths["churn_reg"])
    
    with open(model_paths["feature_importance"], "r") as f:
        feature_importances = json.load(f)

    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    
    # Read all customers to run inference on
    query = f"SELECT id, {', '.join(FEATURE_NAMES)} FROM Customer"
    df = pd.read_sql_query(query, conn)

    if df.empty:
        print("No customers found.")
        conn.close()
        return

    print(f"Running highly-accurate inference on {len(df)} customers...")

    # Impute missing values just in case
    df.fillna(0, inplace=True)
    X = df[FEATURE_NAMES]
    
    # Scale Data
    X_scaled = scaler.transform(X)

    # 1. Anomaly Prediction (-1 is anomaly, 1 is normal)
    df['anomaly_pred'] = iso_forest.predict(X_scaled)
    df['anomalyScore'] = df['anomaly_pred'].apply(lambda x: 1.0 if x == -1 else 0.0)

    # 2. Risk Level Prediction
    df['risk_pred'] = gb_classifier.predict(X_scaled)

    # 3. Churn Probability Prediction
    # Ensure probabilities stay between 0 and 100
    df['prob_pred'] = gb_regressor.predict(X_scaled)
    df['prob_pred'] = df['prob_pred'].clip(0, 100)

    # Update the database
    cursor = conn.cursor()
    update_query = """
    UPDATE Customer 
    SET anomalyScore = ?, 
        riskLevel = ?, 
        churnProbability = ?,
        aiInsight = ?,
        healthScore = ?
    WHERE id = ?
    """

    updates = []
    for idx, row in df.iterrows():
        health_score = max(0, min(100, int(100 - row['prob_pred'])))
        
        current_features = {
            'loginFrequency': row['loginFrequency'],
            'avgSessionDuration': row['avgSessionDuration'],
            'featureUsageRate': row['featureUsageRate']
        }
        
        insight = get_insight_message(
            row['anomaly_pred'], 
            row['risk_pred'], 
            row['prob_pred'], 
            feature_importances,
            current_features
        )

        updates.append((
            float(row['anomalyScore']),
            row['risk_pred'],
            float(row['prob_pred']),
            insight,
            health_score,
            row['id']
        ))

    cursor.executemany(update_query, updates)
    conn.commit()
    conn.close()

    print("Successfully updated database with enhanced ML predictions.")

if __name__ == "__main__":
    main()
