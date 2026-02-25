"use client";

import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, TrendingDown, DollarSign,
  Users, Brain, ChevronRight, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { useAppStore } from "@/lib/store";
import { getAnalytics } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RiskAnalysisPage() {
  const { users, anomalySensitivity, setAnomalySensitivity } = useAppStore();
  const analytics = getAnalytics(users);

  const highRiskUsers = users.filter(u => u.riskLevel === "High").slice(0, 10);

  // Risk score distribution (histogram)
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    count: users.filter(u => u.riskScore >= i * 10 && u.riskScore < (i + 1) * 10).length,
    isHigh: i >= 7,
    isMed: i >= 4 && i < 7,
  }));

  // Radar data for risk factors
  const radarData = [
    { subject: "Engagement", A: 72, B: 38 },
    { subject: "Recency", A: 80, B: 25 },
    { subject: "Feature Use", A: 65, B: 42 },
    { subject: "Sessions", A: 88, B: 32 },
    { subject: "Login Freq", A: 75, B: 29 },
    { subject: "Growth", A: 60, B: 48 },
  ];

  // Revenue at risk by plan
  const revenueData = ["Starter", "Growth", "Professional", "Enterprise"].map(plan => {
    const planUsers = users.filter(u => u.plan === plan && u.riskLevel === "High");
    const revenue = planUsers.reduce((s, u) => s + u.mrr, 0);
    return { plan, revenue, count: planUsers.length };
  });

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Risk Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deep-dive risk segmentation and revenue impact
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gradient-bg text-white border-0 gap-2"
          onClick={() => toast.success("PDF risk report generated")}
        >
          <Download className="w-3 h-3" />
          Download PDF Report
        </Button>
      </div>

      {/* Risk Score Formula */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-indigo-400">Risk Score Formula</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="font-mono text-sm">
            <span className="text-foreground font-bold">Risk Score</span>
            <span className="text-muted-foreground"> = </span>
            <span className="text-indigo-400">(0.5 × anomaly_score)</span>
            <span className="text-muted-foreground"> + </span>
            <span className="text-yellow-400">(0.3 × trend_decline_score)</span>
            <span className="text-muted-foreground"> + </span>
            <span className="text-blue-400">(0.2 × recency_decay_score)</span>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">71–100 High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">41–70 Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">0–40 Low</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sensitivity Slider */}
      <div className="glass-card rounded-2xl border border-white/8 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">Anomaly Sensitivity</h3>
            <p className="text-xs text-muted-foreground">Adjust the threshold for flagging anomalous behavior</p>
          </div>
          <Badge className="text-sm font-bold gradient-text border-indigo-500/20 bg-indigo-500/10">
            {anomalySensitivity}%
          </Badge>
        </div>
        <div className="px-2">
          <Slider
            value={[anomalySensitivity]}
            min={10}
            max={90}
            step={5}
            onValueChange={([val]) => setAnomalySensitivity(val)}
            className="my-4"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low Sensitivity (fewer alerts)</span>
          <span>High Sensitivity (more alerts)</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Risk Distribution Histogram */}
        <div className="glass-card rounded-2xl border border-white/8 p-5">
          <h3 className="font-semibold text-sm mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Users">
                {buckets.map((entry, i) => (
                  <Cell key={i} fill={entry.isHigh ? "#ef4444" : entry.isMed ? "#eab308" : "#22c55e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart - Healthy vs At-Risk */}
        <div className="glass-card rounded-2xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Healthy vs At-Risk Profile</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Healthy
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" /> At-Risk
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Healthy" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Radar name="At-Risk" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue at Risk */}
      <div className="glass-card rounded-2xl border border-white/8 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Revenue at Risk by Plan</h3>
            <p className="text-xs text-muted-foreground">MRR exposure from high-risk users</p>
          </div>
          <Badge className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
            <DollarSign className="w-3 h-3 mr-1" />
            ${analytics.revenueAtRisk.toLocaleString()} total
          </Badge>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {revenueData.map((item) => (
            <div key={item.plan} className="glass-card rounded-xl p-4 border border-white/8 text-center">
              <p className="text-xs text-muted-foreground mb-2">{item.plan}</p>
              <p className="text-xl font-bold text-red-400">${item.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.count} users at risk</p>
            </div>
          ))}
        </div>
      </div>

      {/* High Risk Users Table */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-sm">Top 10 High-Risk Users</h3>
          </div>
          <Badge className="text-xs badge-high">{analytics.highRiskUsers} total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk Score</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Anomaly</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Decline</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">MRR</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground">{user.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-400 font-bold font-mono">{user.riskScore}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{user.anomalyScore}</td>
                  <td className="px-4 py-3">
                    <span className="text-red-400">-{user.engagementDecline}%</span>
                  </td>
                  <td className="px-4 py-3 font-mono">${user.mrr}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className="h-6 text-xs px-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      onClick={() => toast.success(`Retention playbook triggered for ${user.name}`)}
                    >
                      Alert <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
