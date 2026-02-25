"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, LineChart as LineChartIcon, Calendar } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine
} from "recharts";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getEngagementTimeline, getFeatureUsage } from "@/lib/data";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PERIODS = ["7d", "30d", "90d"] as const;

export default function EngagementPage() {
  const { users } = useAppStore();
  const [period, setPeriod] = useState<typeof PERIODS[number]>("30d");

  const timelineData = getEngagementTimeline();
  const featureData = getFeatureUsage();

  // Cohort engagement data by risk level
  const cohortData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    return {
      month: month.toLocaleDateString("en-US", { month: "short" }),
      high: Math.round(15 + Math.random() * 15 + i * 0.5),
      medium: Math.round(40 + Math.random() * 10 + i * 0.3),
      low: Math.round(60 + Math.random() * 10 + i),
    };
  });

  // Session trend data
  const sessionData = timelineData.map(d => ({
    date: d.date,
    sessions: d.sessions,
    newUsers: d.newUsers,
    avgDuration: Math.floor(15 + Math.random() * 25),
  }));

  // Engagement velocity metrics
  const velocityMetrics = [
    {
      label: "Weekly Active Users",
      current: Math.round(users.filter(u => u.recencyScore > 0.7).length),
      prev: Math.round(users.filter(u => u.recencyScore > 0.7).length * 0.92),
      trend: "up",
    },
    {
      label: "Avg Session Duration",
      current: "24.3 min",
      prev: "21.8 min",
      trend: "up",
    },
    {
      label: "Feature Adoption Rate",
      current: "64%",
      prev: "68%",
      trend: "down",
    },
    {
      label: "Day-7 Retention",
      current: "71%",
      prev: "74%",
      trend: "down",
    },
  ];

  const filteredData = period === "7d" ? timelineData.slice(-7) : period === "30d" ? timelineData : timelineData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Engagement Trends</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Longitudinal engagement analysis and cohort health
          </p>
        </div>
        <div className="flex items-center gap-1 glass-card border border-white/10 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p
                  ? "gradient-bg text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Velocity Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {velocityMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl border border-white/8 p-4"
          >
            <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
            <p className="text-2xl font-bold mb-1">{metric.current}</p>
            <div className="flex items-center gap-1 text-xs">
              {metric.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className="text-muted-foreground">vs {metric.prev}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Engagement Chart */}
      <div className="glass-card rounded-2xl border border-white/8 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Platform Engagement Score</h3>
            <p className="text-xs text-muted-foreground">Combined engagement across all user segments</p>
          </div>
          <Badge className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            <Calendar className="w-3 h-3 mr-1" />
            {period}
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="engGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={period === "7d" ? 0 : 4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <ReferenceLine y={70} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" label={{ value: "Churn threshold", fontSize: 9, fill: "#ef4444" }} />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#6366f1"
              fill="url(#engGrad1)"
              strokeWidth={2}
              dot={false}
              name="Engagement %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions + Cohort Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Session Volume */}
        <div className="glass-card rounded-2xl border border-white/8 p-5">
          <h3 className="font-semibold text-sm mb-4">Session Volume Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }}
              />
              <Bar dataKey="sessions" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.8} name="Sessions" />
              <Bar dataKey="newUsers" fill="#a855f7" radius={[3, 3, 0, 0]} opacity={0.6} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cohort Engagement by Risk Level */}
        <div className="glass-card rounded-2xl border border-white/8 p-5">
          <h3 className="font-semibold text-sm mb-4">Cohort Engagement by Risk Segment</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={false} name="High Risk %" />
              <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={false} name="Medium Risk %" />
              <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} name="Low Risk %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Decline Analysis */}
      <div className="glass-card rounded-2xl border border-white/8 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Feature Engagement Decline Analysis</h3>
            <p className="text-xs text-muted-foreground">Month-over-month feature adoption changes</p>
          </div>
        </div>
        <div className="space-y-3">
          {featureData.map((feature, i) => {
            const change = feature.usage - feature.prev;
            const pct = Math.round((change / feature.prev) * 100);
            return (
              <motion.div
                key={feature.feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{feature.feature}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-8 text-right">{feature.usage}%</span>
                <span className={`text-xs font-medium w-12 text-right ${pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {pct >= 0 ? "+" : ""}{pct}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
