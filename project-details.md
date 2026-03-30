# Comprehensive Breakdown: Churnova AI Platform (`churnova-ai`)

This document provides a highly technical, exhaustive overview of the **Churnova AI** platform, documenting its architecture, Machine Learning integration, data flow, and underlying codebase structure. 

---

## 1. Executive Summary

**Product Name:** Churnova AI
**Core Mission:** To predict, explain, and prevent software-as-a-service (SaaS) customer churn using real-time behavioral telemetry and advanced Machine Learning (ML).

Unlike retrospective analytics tools that report churn *after* a customer cancels, Churnova acts as an intelligent early-warning system. It ingests usage data via a tracking API, passes it through a 3-tier Python ML ensemble pipeline, and provides product owners with a centralized Dashboard containing Health Scores, Risk Levels, and Explainable AI Insights.

---

## 2. Platform Value & Use Cases ("How It Helps")

Churnova AI solves the "Silent Churn" problem—where users slowly stop using a product over weeks without complaining, eventually canceling their subscription.

### Key Use Cases:
1. **Predictive Revenue Protection (MRR):** Calculates the exact Monthly Recurring Revenue at risk by tracking the `churnProbability` and `subscriptionStatus` of high-value accounts.
2. **AI Diagnostics (Explainability):** Instead of just saying "User A is at risk," the platform generates a dynamic AI insight (e.g., *"Critically low feature adoption. The user is struggling to find value"*). This directs Customer Success teams exactly on *how* to save the account.
3. **Automated Alerting:** By connecting Webhooks, Email notifications, and Slack integrations, teams are immediately alerted when a top-tier account's health score crosses a critical threshold.
4. **Behavioral Cohort Tracking:** Automatically groups users based on `loginFrequency` and `avgSessionDuration` to visualize broader engagement trends.

---

## 3. Technology Stack & Dependencies

Churnova AI relies on a modern, decoupled architecture splitting a highly responsive web frontend from a computationally heavy ML backend.

### Frontend App & Dashboards
*   **Next.js 15.5+ (App Router):** Core React meta-framework utilizing Turbopack for lightning-fast dev builds.
*   **React 19:** View layer component UI.
*   **Tailwind CSS 4.0:** Utility-first styling with comprehensive custom design tokens (e.g., CSS variable gradients and `framer-motion` animations).
*   **Radix UI:** Headless UI components (Dialogs, Sliders, Tooltips, Switches, Separators) for high-accessibility widgets.
*   **Recharts 2.15:** Complex SVG charting for cohort engagement visualization and anomaly tracking over time.
*   **Zustand 5.0:** Lightweight global state management for the client applications.

### Backend Infrastructure & Data
*   **Prisma ORM (v7.4.1):** Type-safe database management.
*   **SQLite (LibSQL Adapter @libsql/client):** Allows SQLite to run at the Edge (optimized for platforms like Turso).
*   **@clerk/nextjs:** Comprehensive Authentication (OAuth, JWT management).
*   **Resend & Nodemailer:** SMTP/API transactional email delivery for system alerts.

### Data Science & Machine Learning Pipeline (Python 3.x)
*   **Pandas & NumPy:** Core data manipulation and matrix operations.
*   **Scikit-Learn (sklearn):** The primary ML modeling suite utilized for both unsupervised anomaly detection and supervised risk regression.
*   **Joblib:** Serialization tool for saving and loading the compiled ML `.joblib` model artifacts.

---

## 4. Deep Dive: Machine Learning & Data Science

The platform does not rely on simple heuristic rules (e.g., "if logins < 2 -> High Risk"). Instead, it uses a sophisticated multi-node ML pipeline stored in the `ml/` directory.

### The Input Features
The models train on behavioral scalars recorded in the `Customer` table:
1.  `loginFrequency`: The velocity/rate of user sessions.
2.  `avgSessionDuration`: The depth of engagement (time-on-task).
3.  `featureUsageRate`: Breadth of adoption (percentage of platform capabilities utilized).

### Node 1: Unsupervised Anomaly Detection (`IsolationForest`)
Located in `ml/train.py`, the pipeline establishes a baseline of "normal" behavior using an `IsolationForest` (Contamination = 0.1). 
*   **Purpose:** To flag usage patterns that break entirely from established routines, returning an `anomaly_pred` of `-1` (anomalous) or `1` (normal).

### Node 2: Supervised Risk Level Classification (`HistGradientBoostingClassifier`)
Because churn requires distinct operational tiers (for routing to varying support levels), a Gradient Boosting Classifier assigns discrete tags (`Low`, `Medium`, `High` risk). 
*   **Tuning:** Uses `GridSearchCV` to test various learning rates and tree depths to maximize categorization accuracy.

### Node 3: Continuous Churn Probability (`HistGradientBoostingRegressor`)
A companion regressor calculates the absolute probability of churn as a percentage (0% to 100%).
*   **Metric:** Uses Mean Absolute Error (MAE) and computes exact flight risk `prob_pred`.
*   **Explainability (Permutation Importance):** The script executes `permutation_importance(best_reg, X, y)` to calculate the "Global Feature Importance Weights". This is exported as `feature_importance.json`.

### Inference Generation (`ml/predict.py`)
The `predict.py` script acts as the batch inference engine. It:
1. Connects to `dev.db`.
2. Downloads the entire customer subset.
3. Scales inputs, runs inference against the `.joblib` artifacts.
4. **Calculates "AI Insights":** By intersecting a specific user's lowest performing feature with the *Global Feature Importance* JSON map, it crafts human-readable diagnostic sentences.
5. Updates the database `Customer` records `churnProbability` and `aiInsight` fields via a bulk `UPDATE`.

---

## 5. Architectural Data Flow

How data moves through the application lifecycle:

1.  **Ingestion:** A customer triggers an event in the target SaaS. A POST request is sent to `/api/track`. 
2.  **Authentication & Storage:** The `/track` route validates the `Bearer` token against the `ApiKey` table. It upserts the telemetry data into the `Customer` table, tracking their `externalId` and numeric features, and appending an `api_ping` event.
3.  **Model Scoring:** Periodically, the SaaS owner runs the ML worker (or `npx tsx scripts/generate_dataset.ts` for testing). The data is pulled, scored by Scikit-Learn, and updated with risk levels.
4.  **Presentation Layer:** The Next.js `/dashboard` polls the internal API. A highly visual React dashboard renders the `anomalyScores` and Recharts plotting their historical baseline trends vs current behavior. 
5.  **Alerting Automation:** If a `prob_pred` exceeds 75% on a high MRR customer, background cron jobs utilize configuring Webhook URLs or Resend to issue alerts.

---

## 6. Comprehensive Project Structure

### `/src/app/` (Next.js Application Architecture)
*   **`/api/`**: Contains the decoupled microservice REST endpoints.
    *   `/track/`, `/identify/`, `/events/`: Public-facing data ingestion endpoints requiring API keys.
    *   `/analytics/`, `/projects/`, `/customers/`: Internal application endpoints used by the dashboard.
    *   `/cron/`, `/email/`, `/alerts/`: Automation endpoints for background tasks.
*   **`/dashboard/`**: The protected user console.
    *   `/anomalies/`, `/risk/`, `/engagement/`: Specialized visual reporting views.
    *   `/intelligence/`, `/cohorts/`: Data science intersections displaying the ML `aiInsights`.
    *   `/connect/`, `/settings/`: Onboarding, API key generation, and Webhook management.
*   **`/page.tsx`**: The highly optimized Landing Page featuring dynamic WebGL-style CSS mesh gradients, animated intersection observers, and feature showcases.

### `/prisma/` (Database Schema)
*   **`schema.prisma`**: The single source of truth for the database layout.
    *   **Project model:** Stores `slackWebhookUrl`, `alertEmail`, `stripeKey`, tracking multiple projects for one owner.
    *   **Customer model:** Stores the massive telemetry array (`anomalyScore`, `loginFrequency`, `churnProbability`, `mrr`, `plan`).
    *   **Event & HealthScore models:** Used for timeseries tracking of interactions securely joined to the `Customer`.

### `/scripts/generate_dataset.ts` (Data Engineering)
A sophisticated massive data mocking engine utilized for Demo generation and ML test sets.
*   Generates 2,000+ realistic B2B SaaS accounts belonging to randomized fake companies ("Acme Corp", "TechFlow").
*   Simulates realistic churn distributions: It assigns 25% to High Risk, intentionally skewing their simulated telemetry downward (`anomalyScore = 0.6-0.95`, `loginFrequency = 0.2-1.5`) so the ML model has mathematically valid corrupted data to find.
*   Generates simulated Subscriptions (`Pro`, `Enterprise`) and assigns standard MRR values for revenue tracking.

---

## 7. Final Assessment & Inclusion Summary

The **Churnova AI** repository is a complete, full-stack predictive AI product. It includes:
*   **UI/UX:** A production-ready, highly polished Next.js 15 dashboard and landing page.
*   **Backend:** An edge-ready database schema supported by protected API routes and webhook alerting.
*   **DS/ML Pipeline:** Standardized Python scripts, serialized models (`isolation_forest`, `gb_classifier`, `gb_regressor`), and a mathematical explainability engine.
*   **Dev-Ops Hooks:** Integration stubs for Slack alerts and payment processors (Razorpay, Paddle, Stripe).
*   **Automation:** Scripting resources to safely mock and test massive data loads (`8000+` telemetry points) directly onto local SQLite databases.
