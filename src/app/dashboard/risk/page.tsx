"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle, DollarSign, Shield, Users, Brain, ChevronRight, Download, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { useAppStore } from "@/lib/store";
import { getAnalytics } from "@/lib/data";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { exportRiskReportCSV } from "@/lib/export";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RiskAnalysisPage() {
  const { users } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const analytics = getAnalytics(users);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Analyzing risk...</p>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      exportRiskReportCSV(users);
      toast.success("Risk Report downloaded as CSV!");
    } catch (e) {
      toast.error("Failed to generate Risk Report");
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

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
  const revenueData = ["Free", "Basic", "Pro"].map(plan => {
    const planUsers = users.filter(u => u.plan === plan && u.riskLevel === "High");
    const revenue = planUsers.reduce((s, u) => s + u.mrr, 0);
    return { plan, revenue, count: planUsers.length };
  });

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between" data-html2canvas-ignore>
        <div>
          <h1 className="text-2xl font-bold">Risk Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deep-dive risk segmentation and revenue impact
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gradient-bg text-white border-0 gap-2"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          <Download className="w-3 h-3" />
          {isDownloading ? "Generating..." : "Download PDF Report"}
        </Button>
      </div>

      {/* Risk Score Explainer */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-sm">How is the Risk Score calculated?</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              label: "Unusual Behavior",
              desc: "How different a user's behavior is from normal — low logins, very short or very long sessions",
              weight: 50,
              color: "bg-indigo-500",
              textColor: "text-indigo-600",
              bgColor: "bg-indigo-50",
            },
            {
              label: "Engagement Trend",
              desc: "Whether a user's activity is declining over time — fewer features used, less time on platform",
              weight: 30,
              color: "bg-yellow-500",
              textColor: "text-yellow-600",
              bgColor: "bg-yellow-50",
            },
            {
              label: "Recent Activity",
              desc: "How recently the user was active — users who haven't logged in recently score higher risk",
              weight: 20,
              color: "bg-blue-500",
              textColor: "text-blue-600",
              bgColor: "bg-blue-50",
            },
          ].map((factor) => (
            <div key={factor.label} className={`rounded-xl ${factor.bgColor} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${factor.textColor}`}>{factor.label}</span>
                <span className={`text-xs font-mono font-bold ${factor.textColor}`}>{factor.weight}%</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{factor.desc}</p>
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div className={`h-full ${factor.color} rounded-full`} style={{ width: `${factor.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-muted-foreground">Score ranges:</p>
          {[
            { label: "High Risk", range: "71–100", color: "bg-red-100 text-red-600 border-red-200" },
            { label: "Medium Risk", range: "41–70", color: "bg-yellow-100 text-yellow-600 border-yellow-200" },
            { label: "Low Risk", range: "0–40", color: "bg-green-100 text-green-600 border-green-200" },
          ].map(r => (
            <span key={r.label} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${r.color}`}>
              {r.label} ({r.range})
            </span>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Risk Distribution Histogram */}
        <div className="glass-card rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
        <div className="glass-card rounded-2xl p-5 shadow-sm">
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
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Healthy" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Radar name="At-Risk" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue at Risk */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Revenue at Risk by Plan</h3>
            <p className="text-xs text-muted-foreground">MRR exposure from high-risk users</p>
          </div>
          <Badge className="text-xs badge-high">
            <DollarSign className="w-3 h-3 mr-1" />
            ${analytics.revenueAtRisk.toLocaleString()} total
          </Badge>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {revenueData.map((item) => (
            <div key={item.plan} className="glass-card rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-muted-foreground mb-2">{item.plan}</p>
              <p className="text-xl font-bold text-red-600">${item.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.count} users at risk</p>
            </div>
          ))}
        </div>
      </div>

      {/* High Risk Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
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
              <tr className="border-b border-border bg-slate-50/50">
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
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground">{user.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-600 font-bold font-mono">{user.riskScore}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{user.anomalyScore}</td>
                  <td className="px-4 py-3">
                    <span className="text-red-600">-{user.engagementDecline}%</span>
                  </td>
                  <td className="px-4 py-3 font-mono">${user.mrr}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className="h-6 text-xs px-2 badge-high hover:bg-red-100 transition-colors"
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
