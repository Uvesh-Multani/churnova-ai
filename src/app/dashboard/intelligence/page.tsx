"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  RefreshCw, BrainCircuit, AlertCircle, CheckCircle2,
  TrendingDown, Cpu, BarChart2, Activity, Zap
} from "lucide-react";
import Badge from "@/components/ui/badge";

interface Reason {
  reason: string;
  percentage: number;
}

interface MLMetrics {
  anomaly: { contamination: number; model: string };
  classification: { accuracy: number; best_params: Record<string, string | number | null>; model: string };
  regression: { mae: number; best_params: Record<string, string | number | null>; model: string; feature_importance: Record<string, number> };
}

export default function IntelligencePage() {
  const { activeProjectId } = useAppStore();
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainStatus, setRetrainStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectId) return;

    const fetchReasons = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/reasons?projectId=${activeProjectId}`);
        if (!res.ok) throw new Error("Failed to fetch reasons");
        const data = await res.json();
        setReasons(data.reasons || []);
      } catch (err) {
        console.error("Error fetching AI reasons:", err);
      } finally {
        setLoading(false);
      }
    };

    // Load metrics from local JSON file via a simple API probe
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/dashboard/ml/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch {
        // metrics file may not exist yet
      }
    };

    fetchReasons();
    fetchMetrics();
  }, [activeProjectId]);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainStatus("Running pipeline...");
    try {
      const res = await fetch("/api/dashboard/ml/retrain", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setRetrainStatus("✓ Models retrained successfully");
        if (data.metrics) setMetrics(data.metrics);
      } else {
        setRetrainStatus("⚠ Retrain failed: " + (data.details || "unknown error"));
      }
    } catch {
      setRetrainStatus("⚠ Retrain request failed");
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Analyzing churn patterns...</p>
        </div>
      </div>
    );
  }

  const getPlaybook = (reason: string) => {
    if (reason.includes("Feature Adoption")) return [
      "Trigger an in-app tutorial series to guide them to 'Aha!' moments.",
      "Highlight underused features with contextual tooltips or an adoption checklist.",
      "Send a personalized email: 'Here's what 80% of teams like yours use every day.'"
    ];
    if (reason.includes("Login") || reason.includes("Session")) return [
      "Send an automated 'We miss you' re-engagement email sequence.",
      "Offer a 1:1 check-in call with a Customer Success Manager.",
      "Trigger a win-back campaign with a limited-time discount or extension."
    ];
    if (reason.includes("Anomalous")) return [
      "Alert account manager immediately for a manual review.",
      "Investigate if recent product updates caused friction.",
      "Send a quick 3-question feedback survey asking if they need help."
    ];
    return [
      "Review user session recordings to find friction points.",
      "Send a customized outreach email from the founder."
    ];
  };

  const featureLabels: Record<string, string> = {
    loginFrequency: "Login Frequency",
    avgSessionDuration: "Session Duration",
    featureUsageRate: "Feature Usage Rate"
  };

  const maxImportance = metrics?.regression?.feature_importance
    ? Math.max(...Object.values(metrics.regression.feature_importance))
    : 1;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
            Churn Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-driven insights powered by Gradient Boosting ML models.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {retrainStatus && (
            <span className="text-xs text-muted-foreground">{retrainStatus}</span>
          )}
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? "animate-spin" : ""}`} />
            {retraining ? "Retraining..." : "Retrain Models"}
          </button>
        </div>
      </div>

      {/* ML Model Performance Card */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-sm text-indigo-600">ML Model Performance</h2>
            <Badge className="ml-auto text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100">
              {metrics.classification.model}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Accuracy */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Risk Classifier Accuracy</span>
              </div>
              <p className="text-3xl font-bold text-green-700 font-mono">
                {(metrics.classification.accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-green-600 mt-1">
                Best params: lr={metrics.classification.best_params?.learning_rate}, depth={metrics.classification.best_params?.max_depth ?? "auto"}
              </p>
            </div>

            {/* MAE */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Churn Regressor MAE</span>
              </div>
              <p className="text-3xl font-bold text-orange-700 font-mono">
                ±{metrics.regression.mae.toFixed(2)}%
              </p>
              <p className="text-[10px] text-orange-600 mt-1">
                Best params: lr={metrics.regression.best_params?.learning_rate}, l2={metrics.regression.best_params?.l2_regularization}
              </p>
            </div>

            {/* Anomaly */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Anomaly Detector</span>
              </div>
              <p className="text-3xl font-bold text-blue-700 font-mono">
                {(metrics.anomaly.contamination * 100).toFixed(0)}%
              </p>
              <p className="text-[10px] text-blue-600 mt-1">
                {metrics.anomaly.model} · contamination threshold
              </p>
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          {metrics.regression.feature_importance && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Permutation Feature Importance (Churn Regressor)
              </p>
              <div className="space-y-3">
                {Object.entries(metrics.regression.feature_importance)
                  .sort((a, b) => b[1] - a[1])
                  .map(([feature, importance]) => (
                    <div key={feature}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{featureLabels[feature] || feature}</span>
                        <span className="text-xs text-muted-foreground font-mono">{importance.toFixed(4)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(importance / maxImportance) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Churn Drivers */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Top Churn Drivers
              </h2>
              <p className="text-xs text-muted-foreground">Identified from high-risk accounts this month</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {reasons.length > 0 ? reasons.map((r, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-sm">{r.reason}</span>
                  <span className="text-xs font-bold text-muted-foreground">{r.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  />
                </div>
              </motion.div>
            )) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No high-risk churn patterns detected yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Playbooks */}
        <div className="glass-card rounded-2xl p-6 shadow-sm h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Retention Playbooks
            </h2>
            <p className="text-xs text-muted-foreground">Actionable steps based on detected problems</p>
          </div>

          <div className="space-y-6 flex-1 overflow-auto pr-2">
            {reasons.length > 0 ? reasons.map((r, idx) => (
              <motion.div
                key={`playbook-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-red-50 text-red-700 border-red-100 text-[10px]">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    Detected: {r.reason}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {getPlaybook(r.reason).map((step, stepIdx) => (
                    <li key={stepIdx} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Awaiting intelligence to generate playbooks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
