"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle, AlertCircle, X, Play,
  Download, RefreshCw, Database, Cpu, BarChart3, Eye
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { toast } from "sonner";

const EXPECTED_COLUMNS = [
  "user_id", "login_count", "avg_session_duration", "feature_usage_count",
  "last_login_date", "signup_date", "total_sessions"
];

const SAMPLE_PREVIEW = [
  { user_id: "USR-0001", login_count: 24, avg_session_duration: 18, feature_usage_count: 142, last_login_date: "2026-02-20", signup_date: "2025-08-15", total_sessions: 87 },
  { user_id: "USR-0002", login_count: 3, avg_session_duration: 4, feature_usage_count: 12, last_login_date: "2026-01-28", signup_date: "2025-06-01", total_sessions: 9 },
  { user_id: "USR-0003", login_count: 18, avg_session_duration: 32, feature_usage_count: 298, last_login_date: "2026-02-23", signup_date: "2025-03-10", total_sessions: 145 },
  { user_id: "USR-0004", login_count: 7, avg_session_duration: 9, feature_usage_count: 45, last_login_date: "2026-02-10", signup_date: "2025-09-22", total_sessions: 31 },
  { user_id: "USR-0005", login_count: 1, avg_session_duration: 2, feature_usage_count: 3, last_login_date: "2026-01-15", signup_date: "2025-07-30", total_sessions: 4 },
];

const ENGINEERED_FEATURES = [
  { name: "engagement_trend_slope", description: "Linear regression slope of 30-day activity", type: "float", status: "computed" },
  { name: "recency_decay_score", description: "Exponential decay based on days since last login", type: "float", status: "computed" },
  { name: "login_frequency_rate", description: "Normalized logins per week", type: "float", status: "computed" },
  { name: "feature_adoption_rate", description: "Features used / total available features", type: "float", status: "computed" },
  { name: "session_duration_trend", description: "Rolling avg session duration change", type: "float", status: "computed" },
  { name: "engagement_decline_pct", description: "Percentage decline from personal baseline", type: "float", status: "computed" },
];

const ANALYSIS_STEPS = [
  { label: "Parsing CSV structure", icon: FileText, duration: 400 },
  { label: "Validating schema columns", icon: CheckCircle, duration: 300 },
  { label: "Handling missing values", icon: Database, duration: 500 },
  { label: "Normalizing numeric features", icon: BarChart3, duration: 400 },
  { label: "Computing engineered features", icon: Cpu, duration: 600 },
  { label: "Running Isolation Forest", icon: RefreshCw, duration: 800 },
  { label: "Calculating engagement trends", icon: BarChart3, duration: 500 },
  { label: "Generating risk scores", icon: AlertCircle, duration: 400 },
  { label: "Creating AI explanations", icon: Cpu, duration: 600 },
  { label: "Finalizing results", icon: CheckCircle, duration: 300 },
];

type UploadState = "idle" | "dragging" | "validating" | "preview" | "analyzing" | "complete";

export default function UploadPage() {
  const { runAnalysis, isAnalyzing, analysisProgress } = useAppStore();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
    setUploadState("validating");
    setTimeout(() => {
      setRowCount(Math.floor(Math.random() * 900) + 100);
      setUploadState("preview");
      toast.success("File validated successfully");
    }, 1200);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRunAnalysis = async () => {
    setUploadState("analyzing");
    setCurrentStep(0);
    setCompletedSteps([]);

    // Simulate step-by-step analysis
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, ANALYSIS_STEPS[i].duration));
      setCompletedSteps(prev => [...prev, i]);
    }

    await runAnalysis();
    setUploadState("complete");
    toast.success("Analysis complete! 120 users processed.", {
      description: "28 high-risk users identified. View results in the Users page.",
    });
  };

  const handleDownloadSample = () => {
    const headers = EXPECTED_COLUMNS.join(",");
    const rows = SAMPLE_PREVIEW.map(r => Object.values(r).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "churnova-sample-data.csv";
    a.click();
    toast.success("Sample dataset downloaded");
  };

  const reset = () => {
    setUploadState("idle");
    setFileName("");
    setFileSize(0);
    setRowCount(0);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const progress = ANALYSIS_STEPS.length > 0
    ? Math.round((completedSteps.length / ANALYSIS_STEPS.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Upload</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload your SaaS usage data for AI-powered churn analysis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-2"
          onClick={handleDownloadSample}
        >
          <Download className="w-3 h-3" />
          Sample Dataset
        </Button>
      </div>

      {/* Schema info */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-400">Expected CSV Schema</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPECTED_COLUMNS.map(col => (
            <Badge key={col} className="text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/20 font-mono">
              {col}
            </Badge>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE / DRAG STATE */}
        {(uploadState === "idle" || uploadState === "dragging") && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
            onDragLeave={() => setUploadState("idle")}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative glass-card rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 ${uploadState === "dragging"
                ? "border-indigo-500/70 bg-indigo-500/5 scale-[1.01]"
                : "border-border hover:border-indigo-500/40 hover:bg-indigo-500/3"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <motion.div
              animate={{ y: uploadState === "dragging" ? -8 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-colors ${uploadState === "dragging" ? "bg-indigo-500/20" : "bg-muted"
                }`}>
                <Upload className={`w-7 h-7 transition-colors ${uploadState === "dragging" ? "text-indigo-400" : "text-muted-foreground"}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {uploadState === "dragging" ? "Release to upload" : "Drop your CSV file here"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse · CSV files only · Max 50MB
              </p>
              <Button
                variant="outline"
                size="sm"
                className="pointer-events-none"
                onClick={(e) => e.stopPropagation()}
              >
                Browse Files
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* VALIDATING */}
        {uploadState === "validating" && (
          <motion.div
            key="validating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-8 border border-white/8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Validating Schema</h3>
            <p className="text-sm text-muted-foreground">Checking column structure and data types...</p>
          </motion.div>
        )}

        {/* PREVIEW STATE */}
        {uploadState === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* File Info */}
            <div className="glass-card rounded-2xl p-4 border border-green-500/20 bg-green-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-400">{fileName || "sample-data.csv"}</p>
                  <p className="text-xs text-muted-foreground">
                    {rowCount} rows · {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : "~45 KB"} · Schema valid
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Validation checks */}
            <div className="glass-card rounded-2xl p-4 border border-white/8">
              <h3 className="text-sm font-semibold mb-3">Schema Validation</h3>
              <div className="grid grid-cols-2 gap-2">
                {EXPECTED_COLUMNS.map(col => (
                  <div key={col} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="font-mono text-muted-foreground">{col}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Preview */}
            <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  Data Preview (first 5 rows)
                </h3>
                <Badge className="text-xs bg-muted text-muted-foreground">{rowCount} total rows</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/10">
                      {EXPECTED_COLUMNS.map(col => (
                        <th key={col} className="px-3 py-2.5 text-left font-medium text-muted-foreground font-mono whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_PREVIEW.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Engineering Preview */}
            <div className="glass-card rounded-2xl p-4 border border-white/8">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Feature Engineering Preview
                <Badge className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">Auto-computed</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ENGINEERED_FEATURES.map(feat => (
                  <div key={feat.name} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-mono font-medium text-purple-400">{feat.name}</p>
                      <p className="text-xs text-muted-foreground">{feat.description}</p>
                    </div>
                    <Badge className="text-xs bg-muted text-muted-foreground ml-auto flex-shrink-0">{feat.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Analysis Button */}
            <Button
              className="w-full h-12 gradient-bg text-white border-0 hover:opacity-90 shadow-lg shadow-indigo-500/20 text-base font-medium"
              onClick={handleRunAnalysis}
            >
              <Play className="w-5 h-5 mr-2" />
              Run AI Analysis
            </Button>
          </motion.div>
        )}

        {/* ANALYZING STATE */}
        {uploadState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-6 border border-white/8 space-y-5"
          >
            <div className="text-center mb-2">
              <h3 className="text-lg font-semibold">AI Analysis Running</h3>
              <p className="text-sm text-muted-foreground">Processing {rowCount || 120} users through ML pipeline...</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Overall Progress</span>
                <span className="font-mono font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {ANALYSIS_STEPS.map((step, i) => {
                const isDone = completedSteps.includes(i);
                const isActive = currentStep === i && !isDone;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: i <= currentStep ? 1 : 0.3 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${isActive ? "bg-indigo-500/10 border border-indigo-500/20" : ""
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-green-500/15" : isActive ? "bg-indigo-500/15" : "bg-muted"
                      }`}>
                      {isDone ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className={`text-xs ${isDone ? "text-green-400" : isActive ? "text-indigo-400 font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin ml-auto" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COMPLETE STATE */}
        {uploadState === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 border border-green-500/20 bg-green-500/5 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-400">Analysis Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {rowCount || 120} users processed through AI pipeline
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Total Processed", value: rowCount || 120, color: "text-foreground" },
                { label: "High Risk", value: 28, color: "text-red-400" },
                { label: "Medium Risk", value: 47, color: "text-yellow-400" },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-xl p-3 border border-white/8">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center mt-2">
              <Button
                className="gradient-bg text-white border-0 text-sm"
                onClick={() => window.location.href = "/dashboard/users"}
              >
                View Results
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>
                Upload Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
