"use client";

import { motion } from "framer-motion";
import {
  Activity, AlertCircle, Filter, Zap, RefreshCw, TrendingDown
} from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis, Cell
} from "recharts";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getAnomalyData } from "@/lib/data";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const COLORS: Record<string, string> = {
  High: "#ef4444",
  Medium: "#eab308",
  Low: "#22c55e",
};

// Custom tooltip for scatter
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { id: string; name: string; risk: string; z: number; x: number; y: number } }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold mb-1">{d.name}</p>
        <p className="text-muted-foreground">{d.id}</p>
        <div className="mt-2 space-y-1">
          <p>Login/week: <span className="font-mono text-indigo-400">{d.x}</span></p>
          <p>Session (min): <span className="font-mono text-indigo-400">{d.y}</span></p>
          <p>Anomaly score: <span className="font-mono text-purple-400">{d.z}</span></p>
          <p>Risk: <span style={{ color: COLORS[d.risk] }}>{d.risk}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnomalyPage() {
  const { users, anomalySensitivity, setAnomalySensitivity, runAnalysis, isAnalyzing } = useAppStore();
  const allAnomalyData = getAnomalyData(users);
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">("All");

  const filtered = filter === "All" ? allAnomalyData : allAnomalyData.filter(d => d.risk === filter);

  const anomalousUsers = users
    .filter(u => u.anomalyScore >= anomalySensitivity / 100)
    .sort((a, b) => b.anomalyScore - a.anomalyScore)
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anomaly Detection</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Isolation Forest model — unsupervised behavioral outlier detection
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gradient-bg text-white border-0 gap-2"
          onClick={async () => {
            await runAnalysis();
            toast.success("Model retrained successfully", {
              description: "Isolation Forest updated with latest usage patterns"
            });
          }}
          disabled={isAnalyzing}
        >
          <RefreshCw className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Retraining..." : "Retrain Model"}
        </Button>
      </div>

      {/* Model Info */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: Activity, label: "Algorithm", value: "Isolation Forest",
            sub: "Unsupervised anomaly detection", color: "text-indigo-400", bg: "bg-indigo-500/10"
          },
          {
            icon: Zap, label: "Contamination Rate", value: `${Math.round(users.filter(u => u.anomalyScore > 0.5).length / users.length * 100)}%`,
            sub: "Users flagged as anomalies", color: "text-purple-400", bg: "bg-purple-500/10"
          },
          {
            icon: TrendingDown, label: "Model Confidence", value: "91.2%",
            sub: "Based on training dataset", color: "text-green-400", bg: "bg-green-500/10"
          },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-2xl border border-white/8 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sensitivity + Scatter */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="glass-card rounded-2xl border border-white/8 p-5 space-y-4">
          <h3 className="font-semibold text-sm">Detection Controls</h3>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Anomaly Threshold</span>
              <span className="font-bold text-indigo-400">{anomalySensitivity}%</span>
            </div>
            <Slider
              value={[anomalySensitivity]}
              min={10}
              max={90}
              step={5}
              onValueChange={([v]) => setAnomalySensitivity(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Permissive</span>
              <span>Strict</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Risk Filter</p>
            <div className="flex flex-wrap gap-2">
              {(["All", "High", "Medium", "Low"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${filter === level
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Flagged count */}
          <div className="glass-card rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400">Flagged Users</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{anomalousUsers.length}</p>
            <p className="text-xs text-muted-foreground">above current threshold</p>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Legend</p>
            {Object.entries(COLORS).map(([risk, color]) => (
              <div key={risk} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-muted-foreground">{risk} Risk</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Behavioral Anomaly Space</h3>
            <span className="text-xs text-muted-foreground">{filtered.length} users plotted</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="x"
                name="Logins/Week"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Logins / Week", position: "insideBottom", offset: -12, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Session Duration (min)"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Session (min)", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <ZAxis type="number" dataKey="z" range={[20, 200]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={filtered} opacity={0.75}>
                {filtered.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.risk]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Bubble size represents anomaly score. Outliers in bottom-left indicate dormant churning users.
          </p>
        </div>
      </div>

      {/* Anomalous Users List */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-sm">Flagged Anomalous Users</h3>
          </div>
          <Badge className="badge-high text-xs">{anomalousUsers.length} flagged</Badge>
        </div>
        <div className="divide-y divide-border/50">
          {anomalousUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs font-bold text-red-400">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.aiInsight.slice(0, 80)}...</p>
              </div>
              <div className="flex items-center gap-4 text-xs flex-shrink-0">
                <div className="text-center">
                  <p className="font-bold font-mono text-red-400">{Math.round(user.anomalyScore * 100)}%</p>
                  <p className="text-muted-foreground">anomaly</p>
                </div>
                <div className="text-center">
                  <p className="font-bold font-mono">{user.riskScore}</p>
                  <p className="text-muted-foreground">risk score</p>
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs px-3 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                  onClick={() => toast.warning(`Alert triggered for ${user.name}`)}
                >
                  Alert
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
