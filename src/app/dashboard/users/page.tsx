"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, X, ChevronDown, ChevronUp, AlertTriangle,
  User, Clock, Activity, TrendingDown, Brain, ArrowUpRight, Mail,
  RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAppStore } from "@/lib/store";
import { UserRecord } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const cls = level === "High" ? "badge-high" : level === "Medium" ? "badge-medium" : "badge-low";
  return (
    <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-medium`}>
      {level}
    </span>
  );
}

function RiskScoreBar({ score }: { score: number }) {
  const color = score >= 71 ? "#ef4444" : score >= 41 ? "#eab308" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-mono font-medium w-8 text-right">{score}</span>
    </div>
  );
}

// User Detail Slide-over Panel
function UserSlideOver({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const churnColor = user.churnProbability >= 70 ? "text-red-400" : user.churnProbability >= 40 ? "text-yellow-400" : "text-green-400";
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full max-w-xl h-full bg-card border-l border-border overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Risk Overview */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Risk Score", value: user.riskScore, suffix: "", icon: AlertTriangle, color: user.riskLevel === "High" ? "text-red-400" : user.riskLevel === "Medium" ? "text-yellow-400" : "text-green-400" },
                { label: "Churn Prob.", value: user.churnProbability, suffix: "%", icon: TrendingDown, color: churnColor },
                { label: "Anomaly", value: Math.round(user.anomalyScore * 100), suffix: "%", icon: Brain, color: "text-purple-400" },
              ].map((metric) => (
                <div key={metric.label} className="glass-card rounded-xl p-3 border border-white/8 text-center">
                  <metric.icon className={`w-4 h-4 mx-auto mb-1.5 ${metric.color}`} />
                  <p className={`text-xl font-bold ${metric.color}`}>{metric.value}{metric.suffix}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Engagement Chart */}
            <div className="glass-card rounded-xl p-4 border border-white/8">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                30-Day Engagement History
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={user.engagementHistory}>
                  <defs>
                    <linearGradient id="userEngGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={7} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="url(#userEngGrad)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Behavioral Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Behavioral Breakdown</h3>
              {[
                { label: "Login Frequency", value: `${user.loginFrequency}/week`, icon: Clock, progress: Math.min(100, user.loginFrequency * 10) },
                { label: "Avg Session Duration", value: `${user.avgSessionDuration} min`, icon: Activity, progress: Math.min(100, user.avgSessionDuration * 2) },
                { label: "Feature Usage Rate", value: `${user.featureUsageRate}%`, icon: ArrowUpRight, progress: user.featureUsageRate },
                { label: "Engagement Decline", value: `-${user.engagementDecline}%`, icon: TrendingDown, progress: user.engagementDecline, negative: true },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center gap-3">
                  <metric.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                      <span className="text-xs font-medium">{metric.value}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${metric.progress}%`,
                          background: metric.negative ? "#ef4444" : "#6366f1",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="glass-card rounded-xl p-4 border border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-indigo-400">AI Insight</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{user.aiInsight}</p>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "User ID", value: user.id },
                { label: "Company", value: user.company },
                { label: "Plan", value: user.plan },
                { label: "MRR", value: `$${user.mrr}/mo` },
                { label: "Join Date", value: user.joinDate },
                { label: "Last Active", value: user.lastActive },
                { label: "Total Sessions", value: user.sessions },
                { label: "Recency Score", value: user.recencyScore },
              ].map((detail) => (
                <div key={detail.label} className="glass-card rounded-lg p-3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-0.5">{detail.label}</p>
                  <p className="text-sm font-medium truncate">{detail.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 gradient-bg text-white border-0 text-sm h-9"
                onClick={() => {
                  toast.success(`Email alert sent to CS team for ${user.name}`);
                  onClose();
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Alert CS Team
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-sm h-9"
                onClick={() => toast.info("Retention playbook triggered")}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Run Playbook
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function UsersPage() {
  const { users } = useAppStore();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [sortField, setSortField] = useState<keyof UserRecord>("riskScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.company.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (riskFilter !== "All") {
      result = result.filter(u => u.riskLevel === riskFilter);
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortField] as number | string;
      const bVal = b[sortField] as number | string;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return sortDir === "desc"
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });
    return result;
  }, [users, search, riskFilter, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSort = (field: keyof UserRecord) => {
    if (field === sortField) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: keyof UserRecord }) => {
    if (field !== sortField) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-indigo-400" /> : <ChevronUp className="w-3 h-3 text-indigo-400" />;
  };

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Risk Score", "Risk Level", "Anomaly Score", "Decline %", "Last Active", "MRR"].join(","),
      ...filtered.filter(u => u.riskLevel === "High").map(u =>
        [u.id, u.name, u.riskScore, u.riskLevel, u.anomalyScore, u.engagementDecline, u.lastActive, u.mrr].join(",")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "high-risk-users.csv";
    a.click();
    toast.success("High-risk users exported to CSV");
  };

  const cols = [
    { label: "User", field: "name" as keyof UserRecord, width: "w-48" },
    { label: "Risk Score", field: "riskScore" as keyof UserRecord, width: "w-36" },
    { label: "Risk Level", field: "riskLevel" as keyof UserRecord, width: "w-28" },
    { label: "Anomaly Score", field: "anomalyScore" as keyof UserRecord, width: "w-32" },
    { label: "Decline %", field: "engagementDecline" as keyof UserRecord, width: "w-28" },
    { label: "Recency", field: "recencyScore" as keyof UserRecord, width: "w-24" },
    { label: "Last Active", field: "lastActive" as keyof UserRecord, width: "w-32" },
    { label: "Insight", field: "aiInsight" as keyof UserRecord, width: "flex-1" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} users · {users.filter(u => u.riskLevel === "High").length} high risk
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleExport}
          className="h-8 text-xs gradient-bg text-white border-0 gap-2"
        >
          <Download className="w-3 h-3" />
          Export High-Risk CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, company..."
            className="pl-8 h-8 text-xs bg-muted/50"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {(["All", "High", "Medium", "Low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => { setRiskFilter(level); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                riskFilter === level
                  ? level === "High" ? "badge-high" : level === "Medium" ? "badge-medium" : level === "Low" ? "badge-low" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {cols.map((col) => (
                  <th
                    key={col.label}
                    className={`${col.width} px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors`}
                    onClick={() => handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.field} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                  onClick={() => setSelectedUser(user)}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  {/* Risk Score */}
                  <td className="px-4 py-3 w-36">
                    <RiskScoreBar score={user.riskScore} />
                  </td>
                  {/* Risk Level */}
                  <td className="px-4 py-3">
                    <RiskBadge level={user.riskLevel} />
                  </td>
                  {/* Anomaly Score */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono">{user.anomalyScore}</span>
                  </td>
                  {/* Decline */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-red-400 font-medium">-{user.engagementDecline}%</span>
                    </div>
                  </td>
                  {/* Recency */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono">{user.recencyScore}</span>
                  </td>
                  {/* Last Active */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                  </td>
                  {/* Insight */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-muted-foreground truncate">{user.aiInsight}</p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page > 3 ? page - 2 + i : i + 1;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                    p === page ? "gradient-bg text-white" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-over */}
      {selectedUser && (
        <UserSlideOver user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
