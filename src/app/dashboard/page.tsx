"use client";

import { motion } from "framer-motion";
import {
  Users, Activity, Shield, DollarSign, TrendingUp, TrendingDown,
  BarChart3, RefreshCw, Download, AlertTriangle
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { toast } from "sonner";
import { exportAnalyticsSummaryCSV, exportUsersCSV } from "@/lib/export";


// Animated KPI counter
function AnimatedNumber({ target, prefix = "", suffix = "", decimals = 0 }: {
  target: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
  return <span>{prefix}{display}{suffix}</span>;
}

import { useRouter } from "next/navigation";

// KPI Card
function KPICard({
  title, value, prefix = "", suffix = "", change, changeType, icon: Icon, color, delay = 0
}: {
  title: string; value: number; prefix?: string; suffix?: string;
  change: string; changeType: "up" | "down" | "neutral";
  icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: `0 16px 40px -12px ${color}25` }}
      className="relative glass-card rounded-2xl p-5 transition-all duration-300 group overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-[35px] opacity-10 group-hover:opacity-25 transition-opacity duration-500`}
        style={{ background: color }} />

      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
          style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <Badge
          className={`text-xs ${changeType === "up" ? "bg-green-500/10 text-green-400 border-green-500/20" : changeType === "down" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-muted text-muted-foreground"}`}
        >
          {changeType === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {change}
        </Badge>
      </div>
      <div className="relative mt-2">
        <p className="text-[28px] font-bold mb-1 tracking-tight text-foreground">
          <AnimatedNumber target={value} prefix={prefix} suffix={suffix} />
        </p>
        <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
      </div>
    </motion.div>
  );
}

// Heatmap component
function ActivityHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);

  const [data, setData] = useState<number[][]>([]);

  useEffect(() => {
    setData(days.map(() =>
      hours.map(() => Math.floor(Math.random() * 100))
    ));
  }, []);

  const getColor = (value: number) => {
    if (value < 20) return "bg-indigo-500/10";
    if (value < 40) return "bg-indigo-500/25";
    if (value < 60) return "bg-indigo-500/45";
    if (value < 80) return "bg-indigo-500/65";
    return "bg-indigo-500/85";
  };

  if (data.length === 0) return <div className="h-40 animate-pulse bg-white/5 rounded-xl" />;


  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1 mb-1 ml-8">
          {hours.map(h => (
            <div key={h} className="w-7 text-center text-xs text-muted-foreground" style={{ fontSize: "9px" }}>{h}</div>
          ))}
        </div>
        {days.map((day, i) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <span className="w-7 text-xs text-muted-foreground text-right pr-1" style={{ fontSize: "9px" }}>{day}</span>
            {data[i].map((val, j) => (
              <motion.div
                key={j}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i * 12 + j) * 0.003 }}
                className={`w-7 h-4 rounded-sm ${getColor(val)} hover:ring-1 hover:ring-indigo-400 cursor-pointer transition-all`}
                title={`${day} ${hours[j]}: ${val}% activity`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const RISK_COLORS = ["#EF4444", "#F5C542", "#22C55E"]; // Red, Yellow (Accent), Green

export default function OverviewPage() {
  const router = useRouter();
  const { activeProjectId, projects } = useAppStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { users } = useAppStore();

  const fetchData = async () => {
    if (!activeProjectId) return;

    try {
      const res = await fetch(`/api/analytics/summary?projectId=${activeProjectId}`);
      if (res.status === 404) {
        // Project was deleted or ID is stale — layout.tsx will auto-correct activeProjectId
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      setStats(data);
      setCharts(data.charts || []);
      setCustomers([]);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProjectId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      // Export analytics summary
      exportAnalyticsSummaryCSV({
        totalUsers: stats?.totalUsers ?? 0,
        activeUsers: stats?.activeUsers ?? 0,
        highRiskUsers: stats?.highRiskUsers ?? 0,
        mediumRiskUsers: stats?.mediumRiskUsers ?? 0,
        lowRiskUsers: stats?.lowRiskUsers ?? 0,
        revenueAtRisk: stats?.revenueAtRisk ?? 0,
        totalMrr: stats?.totalMrr ?? 0,
        healthScore: stats?.healthScore ?? 0,
      });
      // If we have real users, also export user detail CSV
      if (users.length > 0) {
        exportUsersCSV(users, "churnova_full_export");
      }
      toast.success("Analytics exported! Check your downloads folder.");
    } catch (e) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      change: "+0%",
      changeType: "up" as const,
      icon: Users,
      color: "var(--accent-primary)",
    },
    {
      title: "Active Users (7d)",
      value: stats.activeUsers || 0,
      change: "+0%",
      changeType: "up" as const,
      icon: Activity,
      color: "var(--accent-alt)",
    },
    {
      title: "High Risk Users",
      value: stats.highRiskUsers || 0,
      change: "0",
      changeType: "neutral" as const,
      icon: Shield,
      color: "var(--destructive)",
    },
    {
      title: "MRR @ Risk",
      value: stats.revenueAtRisk || 0,
      prefix: "$",
      change: "Urgent",
      changeType: "down" as const,
      icon: DollarSign,
      color: "var(--destructive)",
    },
    {
      title: "Churn Rate (Month)",
      value: stats.churn?.current || 0,
      suffix: "%",
      change: `vs ${stats.churn?.industryAverage || 4.2}% avg`,
      changeType: ((stats.churn?.current || 0) > (stats.churn?.industryAverage || 4.2) ? "down" : "up") as "up" | "down" | "neutral",
      icon: AlertTriangle,
      color: "var(--accent-alt)",
    },
    {
      title: "Health Score",
      value: stats.healthScore || 0,
      suffix: "/100",
      change: "+0%",
      changeType: "neutral" as const,
      icon: BarChart3,
      color: "var(--accent-alt)",
    },
  ];

  const featureData = [
    { feature: "Dashboard", usage: 94, prev: 96 },
    { feature: "Analytics", usage: 78, prev: 82 },
    { feature: "Reports", usage: 65, prev: 71 },
    { feature: "Integrations", usage: 52, prev: 60 },
  ];

  const anomalyData = customers.map(c => ({
    x: Math.random() * 10,
    y: Math.random() * 60,
    risk: c.riskLevel,
  }));

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{activeProject?.name || "Overview"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time churn intelligence dashboard
          </p>

          {/* Active Data Pipelines */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-medium text-muted-foreground mr-1 uppercase tracking-wider">Active Pipelines:</span>

            {activeProject?.stripeKey && (
              <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 gap-1.5 py-0.5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Stripe
              </Badge>
            )}
            {activeProject?.razorpayKey && (
              <Badge className="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 gap-1.5 py-0.5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                Razorpay
              </Badge>
            )}
            {activeProject?.paddleKey && (
              <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 gap-1.5 py-0.5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Paddle
              </Badge>
            )}
            {activeProject?.dodoWebhookUrl && (
              <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 gap-1.5 py-0.5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Dodo
              </Badge>
            )}
            {stats?.totalUsers > 0 && (
              <span title="Aggregated via CSV Uploads or Developer API">
                <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 gap-1.5 py-0.5 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Custom Data / CSV
                </Badge>
              </span>
            )}

            {!activeProject?.stripeKey && !activeProject?.razorpayKey && !activeProject?.paddleKey && !activeProject?.dodoWebhookUrl && !(stats?.totalUsers > 0) && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200">
                <AlertTriangle className="w-3 h-3 text-yellow-500/50" /> No pipelines connected
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 text-xs gap-2"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="h-8 text-xs gradient-bg text-white border-0 gap-2" onClick={handleExport} disabled={isExporting}>
            <Download className="w-3 h-3" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 0.08} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Engagement Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-sm tracking-wide text-foreground">Engagement Over Time</h3>
              <p className="text-xs text-muted-foreground mt-0.5">30-day rolling average</p>
            </div>
            <Badge className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200 px-2.5 py-1">
              +4.2% vs last month
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="var(--accent-primary)"
                fill="url(#engGrad)"
                strokeWidth={2}
                dot={false}
                name="Avg Health Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 flex flex-col"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-sm tracking-wide text-foreground">Risk Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">User segmentation by risk level</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={stats.riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.riskDistribution.map((entry: any, index: number) => (
                  <Cell key={index} fill={RISK_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {stats.riskDistribution.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value} users</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* High Risk Alert Banner */}
      {stats.highRiskUsers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 border-l-4 border-l-red-400 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400">
                {stats.highRiskUsers} high-risk users require immediate attention
              </p>
              <p className="text-xs text-muted-foreground">
                Critical health scores detected in your active project.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard/risk")}
            className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 text-xs"
          >
            Review Risk
          </Button>
        </motion.div>
      )}
    </div>
  );
}
