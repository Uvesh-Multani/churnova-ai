"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Calendar, Users, TrendingDown,
  BarChart3, CheckCircle, Clock, Plus, X, Eye,
  AlertTriangle, DollarSign, Brain, Activity,
  ChevronRight, Mail, RefreshCw, Zap, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { getAnalytics, getEngagementTimeline, getFeatureUsage } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import {
  exportWeeklyRiskSummaryCSV,
  exportEngagementReportCSV,
  exportChurnForecastCSV,
  exportCohortRetentionCSV,
  exportRevenueAtRiskCSV,
  exportAiInsightsCSV,
} from "@/lib/export";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Report {
  id: string;
  title: string;
  description: string;
  type: "Automated" | "On-Demand";
  frequency: string;
  lastGenerated: string;
  status: "Ready" | "Generating";
  icon: React.ElementType;
  color: string;
  bg: string;
  accentColor: string;
}

// ─── Report Preview Components ────────────────────────────────────────────────

function WeeklyRiskPreview({ users, analytics }: { users: any[]; analytics: any }) {
  const highRisk = users.filter(u => u.riskLevel === "High").slice(0, 8);
  const buckets = Array.from({ length: 5 }, (_, i) => ({
    range: ["0-20", "21-40", "41-60", "61-80", "81-100"][i],
    count: users.filter(u => u.riskScore >= i * 20 && u.riskScore < (i + 1) * 20).length,
    color: ["#22c55e", "#86efac", "#eab308", "#f97316", "#ef4444"][i],
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "High Risk", value: analytics.highRiskUsers, color: "text-red-600", bg: "bg-red-50 border-red-200" },
          { label: "Revenue at Risk", value: `$${analytics.revenueAtRisk.toFixed(0)}`, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Health Score", value: `${analytics.healthScore}%`, color: "text-green-600", bg: "bg-green-50 border-green-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Risk Score Distribution</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={buckets} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="range" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {buckets.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top High-Risk Users</p>
        <div className="space-y-1.5">
          {highRisk.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <div>
                  <p className="text-xs font-medium">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">{u.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-red-600 font-bold">{u.riskScore}</span>
                <span className="text-[10px] text-muted-foreground">${u.mrr}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EngagementPreview({ users }: { users: any[] }) {
  const timeline = getEngagementTimeline(users).slice(-14);
  const featureData = getFeatureUsage(users).slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">14-Day Engagement Trend</p>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="egGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "8px" }} />
            <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2} fill="url(#egGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Feature Adoption</p>
        <div className="space-y-2">
          {featureData.map(f => (
            <div key={f.feature} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 truncate">{f.feature}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${f.usage}%` }} />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">{f.usage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChurnForecastPreview({ users }: { users: any[] }) {
  const sorted = [...users].sort((a, b) => (b.churnProbability || 0) - (a.churnProbability || 0));
  const top10 = sorted.slice(0, 8);
  const buckets = [
    { label: ">80%", count: users.filter(u => (u.churnProbability || 0) >= 80).length, color: "#ef4444" },
    { label: "60-80%", count: users.filter(u => (u.churnProbability || 0) >= 60 && (u.churnProbability || 0) < 80).length, color: "#f97316" },
    { label: "40-60%", count: users.filter(u => (u.churnProbability || 0) >= 40 && (u.churnProbability || 0) < 60).length, color: "#eab308" },
    { label: "<40%", count: users.filter(u => (u.churnProbability || 0) < 40).length, color: "#22c55e" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">30-Day Churn Probability Buckets</p>
        <div className="grid grid-cols-4 gap-2">
          {buckets.map(b => (
            <div key={b.label} className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center">
              <p className="text-lg font-bold" style={{ color: b.color }}>{b.count}</p>
              <p className="text-[10px] text-muted-foreground">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Highest Churn Risk</p>
        <div className="space-y-1.5">
          {top10.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-medium">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.plan} · {u.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${u.churnProbability}%` }} />
                </div>
                <span className="text-xs font-mono text-red-600 font-bold w-8 text-right">{u.churnProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CohortPreview({ users }: { users: any[] }) {
  const now = new Date();
  const cohorts = Array.from({ length: 6 }, (_, m) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - m), 1);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - (5 - m) + 1, 1);
    const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const cohortUsers = users.filter(u => {
      const created = new Date(u.joinDate || now);
      return created >= monthDate && created < nextMonthDate;
    });
    const size = cohortUsers.length || Math.floor(Math.random() * 20 + 5);
    const healthyRate = cohortUsers.length > 0
      ? cohortUsers.filter(u => (u.churnProbability || 50) < 50).length / cohortUsers.length
      : 0.65 + Math.random() * 0.2;

    return { label, size, retention: Math.round(healthyRate * 100) };
  });

  const colors = (pct: number) =>
    pct >= 80 ? "bg-green-100 text-green-700"
      : pct >= 60 ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-600";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cohort Retention</p>
        <div className="space-y-2">
          {cohorts.map(c => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12 text-right">{c.label}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center">
                <div className={`h-full rounded-lg transition-all flex items-center px-2 ${colors(c.retention)}`}
                  style={{ width: `${c.retention}%` }}>
                  <span className="text-[10px] font-bold">{c.retention}%</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground w-16">{c.size} users</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueRiskPreview({ users, analytics }: { users: any[]; analytics: any }) {
  const planData = ["Free", "Basic", "Pro"].map(plan => {
    const highRisk = users.filter(u => u.plan === plan && u.riskLevel === "High");
    return { plan, count: highRisk.length, revenue: highRisk.reduce((s, u) => s + (u.mrr || 0), 0) };
  });
  const topAccounts = [...users]
    .filter(u => u.riskLevel === "High")
    .sort((a, b) => (b.mrr || 0) - (a.mrr || 0))
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
        <div>
          <p className="text-xs text-muted-foreground">Total MRR at Risk</p>
          <p className="text-2xl font-bold text-red-600">${analytics.revenueAtRisk.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground text-right">vs Total MRR</p>
          <p className="text-xl font-bold">${analytics.totalMrr.toFixed(2)}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">By Plan</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={planData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="plan" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
            <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} name="MRR at Risk ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Accounts at Risk</p>
        <div className="space-y-1.5">
          {topAccounts.map(u => (
            <div key={u.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-medium">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.plan} · {u.company}</p>
              </div>
              <span className="text-xs font-mono font-bold text-red-600">${u.mrr}/mo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiInsightsPreview({ users }: { users: any[] }) {
  const flagged = users.filter(u => u.riskLevel === "High" || (u.anomalyScore || 0) >= 0.6).slice(0, 6);
  const reasonMap: Record<string, number> = {};
  users.forEach(u => {
    const insight = u.aiInsight || "";
    if (insight.includes("engagement")) reasonMap["Engagement Decline"] = (reasonMap["Engagement Decline"] || 0) + 1;
    if (insight.includes("login") || insight.includes("session")) reasonMap["Low Login Frequency"] = (reasonMap["Low Login Frequency"] || 0) + 1;
    if (insight.includes("feature")) reasonMap["Feature Disengagement"] = (reasonMap["Feature Disengagement"] || 0) + 1;
    if (insight.includes("anomal")) reasonMap["Behavioral Anomaly"] = (reasonMap["Behavioral Anomaly"] || 0) + 1;
  });
  const reasons = Object.entries(reasonMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Churn Drivers</p>
        <div className="space-y-2">
          {reasons.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-36 truncate">{k}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (v / users.length) * 100 * 3)}%` }} />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">AI Insight Samples</p>
        <div className="space-y-2">
          {flagged.map(u => (
            <div key={u.id} className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">{u.name}</p>
                <span className="text-[10px] font-mono text-red-600 font-bold">Risk {u.riskScore}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{u.aiInsight || "No insight generated"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const { users } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const analytics = useMemo(() => getAnalytics(users), [users]);

  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleFrequency, setScheduleFrequency] = useState("Weekly");
  const [activeFilter, setActiveFilter] = useState<"All" | "Automated" | "On-Demand">("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<{ email: string; frequency: string } | null>(null);

  // Check SMTP config on mount
  useEffect(() => {
    // Load existing schedule
    fetch("/api/email/schedule")
      .then(r => r.json())
      .then(d => {
        if (d.schedule) setActiveSchedule({ email: d.schedule.email, frequency: d.schedule.frequency });
      })
      .catch(() => {});
  }, []);


  const today = new Date().toISOString().slice(0, 10);



  const REPORTS: Report[] = [
    {
      id: "weekly-risk",
      title: "Weekly Risk Summary",
      description: "Risk score changes, new high-risk users, and revenue impact across all cohorts",
      type: "Automated",
      frequency: "Every Monday",
      lastGenerated: today,
      status: "Ready",
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50",
      accentColor: "#ef4444",
    },
    {
      id: "engagement",
      title: "Engagement Health Report",
      description: "Detailed engagement trends across all user cohorts with decline analysis",
      type: "Automated",
      frequency: "Monthly",
      lastGenerated: today,
      status: "Ready",
      icon: BarChart3,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      accentColor: "#6366f1",
    },
    {
      id: "churn-forecast",
      title: "30-Day Churn Forecast",
      description: "ML-generated churn predictions for the next 30-day window with confidence scores",
      type: "On-Demand",
      frequency: "Manual",
      lastGenerated: today,
      status: "Ready",
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-50",
      accentColor: "#a855f7",
    },
    {
      id: "user-cohorts",
      title: "Cohort Retention Analysis",
      description: "Retention curves and LTV breakdown by signup cohort and plan tier",
      type: "Automated",
      frequency: "Monthly",
      lastGenerated: today,
      status: "Ready",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
      accentColor: "#3b82f6",
    },
    {
      id: "revenue-risk",
      title: "Revenue at Risk Report",
      description: "MRR exposure analysis with per-account breakdown and urgency prioritization",
      type: "Automated",
      frequency: "Weekly",
      lastGenerated: today,
      status: "Ready",
      icon: DollarSign,
      color: "text-orange-500",
      bg: "bg-orange-50",
      accentColor: "#f97316",
    },
    {
      id: "ai-insights",
      title: "AI Insights Summary",
      description: "Aggregated AI explanations for all flagged users with action recommendations",
      type: "On-Demand",
      frequency: "Manual",
      lastGenerated: today,
      status: "Ready",
      icon: Zap,
      color: "text-green-500",
      bg: "bg-green-50",
      accentColor: "#22c55e",
    },
  ];

  const EXPORT_HANDLERS: Record<string, () => void> = {
    "weekly-risk": () => exportWeeklyRiskSummaryCSV(analytics, users),
    "engagement": () => exportEngagementReportCSV(users),
    "churn-forecast": () => exportChurnForecastCSV(users),
    "user-cohorts": () => exportCohortRetentionCSV(users),
    "revenue-risk": () => exportRevenueAtRiskCSV(users),
    "ai-insights": () => exportAiInsightsCSV(users),
  };

  const filteredReports = useMemo(() =>
    activeFilter === "All" ? REPORTS : REPORTS.filter(r => r.type === activeFilter),
    [activeFilter]
  );

  const handleDownload = (reportId: string, reportTitle: string) => {
    setDownloadingReport(reportId);
    try {
      const handler = EXPORT_HANDLERS[reportId];
      if (handler) {
        handler();
        toast.success(`${reportTitle} — CSV downloaded`, { description: `${users.length} users included` });
      } else {
        toast.error("Export not available");
      }
    } catch (e) {
      toast.error("Failed to generate report");
    } finally {
      setDownloadingReport(null);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleEmail) { toast.error("Please provide an email"); return; }
    setIsScheduling(true);
    try {
      const res = await fetch("/api/email/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: scheduleEmail, frequency: scheduleFrequency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save schedule");

      setActiveSchedule({ email: scheduleEmail, frequency: scheduleFrequency });
      setIsScheduleOpen(false);

      if (data.configured && data.emailSent) {
        toast.success("Schedule saved! Confirmation email sent.", {
          description: `${scheduleFrequency} reports will be sent to ${scheduleEmail}`
        });
      } else {
        toast.success("Schedule saved!", {
          description: `${scheduleFrequency} reports scheduled for ${scheduleEmail}`
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save schedule");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelSchedule = async () => {
    try {
      await fetch("/api/email/schedule", { method: "DELETE" });
      setActiveSchedule(null);
      toast.success("Email schedule cancelled");
    } catch {
      toast.error("Failed to cancel schedule");
    }
  };

  const handleSendTestEmail = async (recipientEmail?: string) => {
    const to = recipientEmail || scheduleEmail;
    if (!to) {
      toast.info("Enter an email address first in the Schedule dialog");
      setIsScheduleOpen(true);
      return;
    }
    setIsSendingEmail(true);
    try {
      const topHighRisk = users
        .filter(u => u.riskLevel === "High")
        .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
        .slice(0, 8)
        .map(u => ({
          name: u.name,
          company: u.company || "",
          riskScore: u.riskScore || 0,
          mrr: u.mrr || 0,
          aiInsight: u.aiInsight || "No insight generated",
        }));

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          reportType: "Weekly Risk Digest",
          analytics: {
            totalUsers: analytics.totalUsers,
            highRiskUsers: analytics.highRiskUsers,
            mediumRiskUsers: analytics.mediumRiskUsers,
            lowRiskUsers: analytics.lowRiskUsers,
            revenueAtRisk: analytics.revenueAtRisk,
            totalMrr: analytics.totalMrr,
            healthScore: analytics.healthScore,
          },
          topHighRiskUsers: topHighRisk,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to send");

      toast.success("Email sent successfully! ✅", {
        description: `Risk digest delivered to ${to}`
      });
    } catch (e: any) {
      toast.error("Failed to send email", { description: e.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const PREVIEW_COMPONENTS: Record<string, React.ReactNode> = {
    "weekly-risk": <WeeklyRiskPreview users={users} analytics={analytics} />,
    "engagement": <EngagementPreview users={users} />,
    "churn-forecast": <ChurnForecastPreview users={users} />,
    "user-cohorts": <CohortPreview users={users} />,
    "revenue-risk": <RevenueRiskPreview users={users} analytics={analytics} />,
    "ai-insights": <AiInsightsPreview users={users} />,
  };

  // Activity log entries
  const activityLog = [
    { action: "Weekly Risk Summary generated", time: "Today, 8:00 AM", icon: TrendingDown, color: "text-red-500" },
    { action: "Email digest sent to team@yourcompany.com", time: "Today, 8:01 AM", icon: Mail, color: "text-indigo-500" },
    { action: "Revenue at Risk Report generated", time: "Mar 14, 9:00 AM", icon: DollarSign, color: "text-orange-500" },
    { action: "AI Insights Summary downloaded", time: "Mar 13, 2:30 PM", icon: Brain, color: "text-purple-500" },
    { action: "Engagement Health Report generated", time: "Mar 1, 8:00 AM", icon: Activity, color: "text-blue-500" },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, download, and schedule data-driven analytics reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-2 border-slate-200"
            onClick={() => toast.info("Reports refreshed")}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gradient-bg text-white border-0 gap-2"
            onClick={() => setIsScheduleOpen(true)}
          >
            <Plus className="w-3 h-3" />
            Schedule Report
          </Button>
        </div>
      </div>


      {/* KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Reports Generated", value: REPORTS.length.toString(), sub: "Available now", icon: FileText, accent: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Users Analyzed", value: analytics.totalUsers.toLocaleString(), sub: "In latest run", icon: Users, accent: "text-blue-600", bg: "bg-blue-50" },
          { label: "High Risk Flags", value: analytics.highRiskUsers.toString(), sub: "Current snapshot", icon: AlertTriangle, accent: "text-red-600", bg: "bg-red-50" },
          { label: "Revenue at Risk", value: `$${analytics.revenueAtRisk.toFixed(0)}`, sub: "MRR exposure", icon: DollarSign, accent: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.accent}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${stat.accent}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Reports Grid + Preview Panel */}
      <div className="flex gap-5">
        {/* Left: Reports List */}
        <div className={`${selectedReport ? "flex-1" : "w-full"} transition-all duration-300`}>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
            {(["All", "Automated", "On-Demand"] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === f ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px -6px rgba(99,102,241,0.12)" }}
                onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                className={`glass-card rounded-2xl border p-5 transition-all duration-200 cursor-pointer shadow-sm ${
                  selectedReport?.id === report.id
                    ? "border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-400/30"
                    : "border-slate-200 hover:border-indigo-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${report.bg} flex items-center justify-center shrink-0`}>
                    <report.icon className={`w-5 h-5 ${report.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm truncate">{report.title}</h3>
                      <Badge className="text-[10px] bg-green-50 text-green-600 border-green-200 shrink-0 h-4 px-1.5">
                        <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                        Live
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{report.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded-md font-medium ${report.type === "Automated" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                      {report.type}
                    </span>
                    <span>·</span>
                    <span>{report.frequency}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 gap-1 text-indigo-600 hover:bg-indigo-50"
                      onClick={e => { e.stopPropagation(); setSelectedReport(report); }}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2 gap-1.5 border-slate-200"
                      disabled={downloadingReport === report.id}
                      onClick={e => { e.stopPropagation(); handleDownload(report.id, report.title); }}
                    >
                      <Download className="w-3 h-3" />
                      {downloadingReport === report.id ? "..." : "CSV"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 glass-card rounded-2xl border border-slate-200 p-5 shadow-sm"
          >
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Recent Report Activity
            </h3>
            <div className="space-y-3">
              {activityLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <entry.icon className={`w-3.5 h-3.5 ${entry.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{entry.action}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.time}</p>
                  </div>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Email Digest Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-5 glass-card rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Email Digest Preview</h3>
                </div>
                <p className="text-xs text-muted-foreground">Automated weekly churn risk email — live data</p>
              </div>
              <Button
                size="sm"
                className="gradient-bg text-white border-0 text-xs h-8 gap-1.5 shadow-sm"
                disabled={isSendingEmail}
                onClick={() => handleSendTestEmail()}
              >
                {isSendingEmail ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Mail className="w-3 h-3" />
                )}
                {isSendingEmail ? "Sending..." : "Send Preview"}
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm max-w-2xl mx-auto shadow-sm">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">C</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Churnova AI</p>
                    <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, 8:00 AM</p>
                  </div>
                  <p className="text-xs text-muted-foreground">To: team@yourcompany.com</p>
                  <p className="text-sm font-medium mt-1">Subject: Weekly Churn Risk Digest — {analytics.highRiskUsers} users flagged</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Hi Team,</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Here's your weekly churn intelligence summary from Churnova AI. Please prioritize outreach to the <strong className="text-foreground">{analytics.highRiskUsers} high-risk accounts</strong> below — they represent <strong className="text-foreground">${analytics.revenueAtRisk.toFixed(0)}</strong> in at-risk MRR this week.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "High Risk", value: analytics.highRiskUsers, color: "text-red-600", bg: "bg-red-50 border-red-200" },
                  { label: "Medium Risk", value: analytics.mediumRiskUsers, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
                  { label: "MRR at Risk", value: `$${analytics.revenueAtRisk.toFixed(0)}`, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1">
                  View Full Risk Report <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Preview Panel */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0, x: 24, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 360 }}
              exit={{ opacity: 0, x: 24, width: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="w-[360px] glass-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Panel Header */}
                <div className={`p-4 border-b border-slate-100 flex items-center gap-3`} style={{ background: `${selectedReport.accentColor}10` }}>
                  <div className={`w-9 h-9 rounded-xl ${selectedReport.bg} flex items-center justify-center shrink-0`}>
                    <selectedReport.icon className={`w-4.5 h-4.5 ${selectedReport.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{selectedReport.title}</p>
                    <p className="text-[10px] text-muted-foreground">Live data preview</p>
                  </div>
                  <button onClick={() => setSelectedReport(null)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {PREVIEW_COMPONENTS[selectedReport.id]}
                </div>

                {/* Panel Footer */}
                <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    className="flex-1 h-8 text-xs gradient-bg text-white border-0 gap-1.5"
                    onClick={() => handleDownload(selectedReport.id, selectedReport.title)}
                    disabled={downloadingReport === selectedReport.id}
                  >
                    <Download className="w-3 h-3" />
                    {downloadingReport === selectedReport.id ? "Generating..." : "Download Full CSV"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-slate-200 gap-1.5"
                    onClick={() => setIsScheduleOpen(true)}
                  >
                    <Calendar className="w-3 h-3" />
                    Schedule
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Schedule Automated Reports
            </DialogTitle>
            <DialogDescription>
              Set up recurring email delivery for your selected reports. All active reports will be included.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deliver To</label>
              <Input
                placeholder="team@yourcompany.com"
                className="text-sm"
                value={scheduleEmail}
                onChange={e => setScheduleEmail(e.target.value)}
              />
              {activeSchedule && (
                <p className="text-[10px] text-indigo-600 font-medium ml-1 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Currently scheduled for {activeSchedule.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frequency</label>
              <div className="flex gap-2">
                {["Daily", "Weekly", "Monthly"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setScheduleFrequency(opt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${scheduleFrequency === opt ? "gradient-bg text-white border-indigo-500" : "bg-slate-50 border-slate-200 text-muted-foreground hover:bg-slate-100"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1.5">Reports included:</p>
              <div className="space-y-1">
                {REPORTS.filter(r => r.type === "Automated").map(r => (
                  <div key={r.id} className="flex items-center gap-1.5 text-xs text-indigo-600">
                    <CheckCircle className="w-3 h-3" />
                    {r.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {activeSchedule && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancelSchedule} 
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Cancel Active Schedule
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => setIsScheduleOpen(false)} className="text-xs">
              {activeSchedule ? "Close" : "Cancel"}
            </Button>
            <Button
              className="gradient-bg text-white border-0 text-xs gap-1.5"
              disabled={isScheduling}
              onClick={handleScheduleSubmit}
            >
              {isScheduling ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              {isScheduling ? "Saving..." : activeSchedule ? "Update Schedule" : "Save Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
