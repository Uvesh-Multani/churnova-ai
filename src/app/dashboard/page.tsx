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
import {
  getAnalytics, getEngagementTimeline, getFeatureUsage, getAnomalyData
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -2, boxShadow: `0 20px 40px ${color}20` }}
      className="relative glass-card rounded-2xl p-5 border border-white/8 hover:border-white/15 transition-all duration-300 group overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}
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
      <div className="relative">
        <p className="text-2xl font-bold mb-1">
          <AnimatedNumber target={value} prefix={prefix} suffix={suffix} />
        </p>
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
      </div>
    </motion.div>
  );
}

// Heatmap component
function ActivityHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
  
  const data = days.map(day => 
    hours.map(() => Math.floor(Math.random() * 100))
  );

  const getColor = (value: number) => {
    if (value < 20) return "bg-indigo-500/10";
    if (value < 40) return "bg-indigo-500/25";
    if (value < 60) return "bg-indigo-500/45";
    if (value < 80) return "bg-indigo-500/65";
    return "bg-indigo-500/85";
  };

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

const RISK_COLORS = ["#ef4444", "#eab308", "#22c55e"];

export default function OverviewPage() {
  const { users } = useAppStore();
  const analytics = getAnalytics(users);
  const engagementData = getEngagementTimeline();
  const featureData = getFeatureUsage();
  const anomalyData = getAnomalyData(users);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const kpis = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      change: "+12.5%",
      changeType: "up" as const,
      icon: Users,
      color: "#6366f1",
    },
    {
      title: "Active Users (7d)",
      value: analytics.activeUsers,
      change: "+8.2%",
      changeType: "up" as const,
      icon: Activity,
      color: "#22c55e",
    },
    {
      title: "High Risk Users",
      value: analytics.highRiskUsers,
      change: "+23.1%",
      changeType: "down" as const,
      icon: Shield,
      color: "#ef4444",
    },
    {
      title: "Revenue at Risk",
      value: analytics.revenueAtRisk,
      prefix: "$",
      change: "-5.4%",
      changeType: "up" as const,
      icon: DollarSign,
      color: "#eab308",
    },
    {
      title: "Health Score",
      value: analytics.healthScore,
      suffix: "%",
      change: "+2.1%",
      changeType: "up" as const,
      icon: BarChart3,
      color: "#a855f7",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time churn intelligence dashboard
          </p>
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
          <Button size="sm" className="h-8 text-xs gradient-bg text-white border-0 gap-2">
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 0.08} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Engagement Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Engagement Over Time</h3>
              <p className="text-xs text-muted-foreground">30-day rolling average</p>
            </div>
            <Badge className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              +4.2% vs last month
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
                stroke="#6366f1"
                fill="url(#engGrad)"
                strokeWidth={2}
                dot={false}
                name="Engagement %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution Pie */}
        <div className="glass-card rounded-2xl p-5 border border-white/8">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Risk Distribution</h3>
            <p className="text-xs text-muted-foreground">User segmentation by risk level</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={analytics.riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {analytics.riskDistribution.map((entry, index) => (
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
            {analytics.riskDistribution.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Feature Usage Bar Chart */}
        <div className="glass-card rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Feature Usage Comparison</h3>
              <p className="text-xs text-muted-foreground">Current vs previous month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="prev" fill="rgba(99,102,241,0.25)" radius={[0, 4, 4, 0]} name="Last Month" />
              <Bar dataKey="usage" fill="#6366f1" radius={[0, 4, 4, 0]} name="This Month" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Anomaly Scatter Plot */}
        <div className="glass-card rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Anomaly Detection Scatter</h3>
              <p className="text-xs text-muted-foreground">Login frequency vs session duration</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Med</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Low</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="x"
                name="Login/Week"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Logins/Week", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Session (min)"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "11px",
                }}
                cursor={{ strokeDasharray: "3 3" }}
              />
              {["High", "Medium", "Low"].map((risk, i) => (
                <Scatter
                  key={risk}
                  name={risk}
                  data={anomalyData.filter(d => d.risk === risk)}
                  fill={RISK_COLORS[i]}
                  opacity={0.7}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="glass-card rounded-2xl p-5 border border-white/8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Activity Intensity Heatmap</h3>
            <p className="text-xs text-muted-foreground">User activity by day and hour</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-0.5">
              {[10, 25, 45, 65, 85].map(o => (
                <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(99,102,241,${o/100})` }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
        <ActivityHeatmap />
      </div>

      {/* High Risk Alert Banner */}
      {analytics.highRiskUsers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 border border-red-500/20 bg-red-500/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400">
                {analytics.highRiskUsers} high-risk users require immediate attention
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated revenue at risk: ${analytics.revenueAtRisk.toLocaleString()}/month
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 text-xs">
            View Users
          </Button>
        </motion.div>
      )}
    </div>
  );
}
