"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, X, ChevronDown, ChevronUp, AlertTriangle,
  User, Clock, Activity, TrendingDown, Brain, ArrowUpRight, Mail,
  RefreshCw
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge";
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


export default function UsersPage() {
  const router = useRouter();
  const { activeProjectId } = useAppStore();
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [sortField, setSortField] = useState<string>("healthScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc"); // Lowest score first
  const [page, setPage] = useState(1);
  const perPage = 15;

  const fetchUsers = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?projectId=${activeProjectId}&risk=${riskFilter}&search=${search}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setLiveUsers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeProjectId, riskFilter, search]);

  const sortedUsers = useMemo(() => {
    return [...liveUsers].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return sortDir === "desc"
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });
  }, [liveUsers, sortField, sortDir]);

  const paginated = sortedUsers.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sortedUsers.length / perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (field !== sortField) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-indigo-400" /> : <ChevronUp className="w-3 h-3 text-indigo-400" />;
  };

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Risk Score", "Risk Level", "Last Active"].join(","),
      ...sortedUsers.filter(u => u.riskLevel === "High").map(u =>
        [u.externalId, u.name, u.healthScore, u.riskLevel, u.lastSeen].join(",")
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
    { label: "User", field: "name", width: "w-48" },
    { label: "Health Score", field: "healthScore", width: "w-36" },
    { label: "Risk Level", field: "riskLevel", width: "w-28" },
    { label: "Last Active", field: "lastSeen", width: "w-32" },
    { label: "Events", field: "events", width: "w-24" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Syncing data..." : `${sortedUsers.length} users tracked`}
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
          <select
            className="bg-muted border border-white/5 rounded-lg text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500/50"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "risk") setRiskFilter("High");
              else if (val === "healthy") setRiskFilter("Low");
              else setRiskFilter("All");
            }}
          >
            <option value="all">All Segments</option>
            <option value="risk">High Risk Segment</option>
            <option value="power">Power Users</option>
            <option value="inactive">Inactive {'>'} 30d</option>
          </select>
          {(["All", "High", "Medium", "Low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => { setRiskFilter(level); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${riskFilter === level
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
                  onClick={() => router.push(`/dashboard/users/${user.id}`)}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(user.name || user.externalId)[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{user.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.externalId}</p>
                      </div>
                    </div>
                  </td>
                  {/* Risk Score */}
                  <td className="px-4 py-3 w-36">
                    <RiskScoreBar score={user.healthScore} />
                  </td>
                  {/* Risk Level */}
                  <td className="px-4 py-3">
                    <RiskBadge level={user.riskLevel} />
                  </td>
                  {/* Last Active */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                  {/* Events */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono">{user._count?.events || 0}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, sortedUsers.length)} of {sortedUsers.length}
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
                  className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === page ? "gradient-bg text-white" : "hover:bg-muted text-muted-foreground"
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
    </div>
  );
}
