"use client";

import { motion } from "framer-motion";
import {
    ChevronLeft, Mail, Calendar, Activity,
    AlertTriangle, TrendingDown, Brain, Clock,
    History, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

export default function CustomerProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`/api/customers/${id}`);
                if (!res.ok) throw new Error("Failed to fetch customer");
                const data = await res.json();
                setCustomer(data);
            } catch (err: any) {
                toast.error(err.message);
                router.push("/dashboard/users");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCustomer();
    }, [id, router]);

    if (loading) {
        return (
            <div className="p-12 flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Analyzing user profile...</p>
                </div>
            </div>
        );
    }

    if (!customer) return null;

    const healthHistoryData = customer.healthHistory?.map((h: any) => ({
        date: new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: h.score,
    })).reverse() || [];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <button
                onClick={() => router.push("/dashboard/users")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Users
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                        {customer.name?.[0] || customer.externalId[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{customer.name || customer.externalId}</h1>
                            <Badge className={`${customer.riskLevel === 'High' ? 'badge-high' : customer.riskLevel === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                                {customer.riskLevel} Risk
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {customer.email || "No email provided"}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Last seen {new Date(customer.lastSeen).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 px-4 gap-2">
                        <Mail className="w-4 h-4" />
                        Send Check-in
                    </Button>
                    <Button className="gradient-bg text-white border-0 h-10 px-6 font-semibold">
                        View CRM Profile
                    </Button>
                </div>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Health Score", value: customer.healthScore, icon: Activity, color: "text-indigo-400" },
                    { label: "Anomaly Score", value: `${(customer.healthScore < 40 ? 0.82 : 0.12) * 100}%`, icon: Brain, color: "text-purple-400" },
                    { label: "Event Count", value: customer.events?.length || 0, icon: History, color: "text-blue-400" },
                    { label: "Client ID", value: customer.externalId, icon: Info, color: "text-emerald-400" },
                ].map((metric) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl border border-white/8 p-5"
                    >
                        <metric.icon className={`w-5 h-5 mb-3 ${metric.color}`} />
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</p>
                        <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health History Chart */}
                <div className="lg:col-span-2 glass-card rounded-2xl border border-white/8 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            Health Score History
                        </h3>
                        <div className="text-xs text-muted-foreground">Last 30 days</div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={customer.healthHistory}>
                                <defs>
                                    <linearGradient id="profileHealthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                                    labelFormatter={(t) => new Date(t).toLocaleString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    fill="url(#profileHealthGrad)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights & Alerts */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-semibold text-indigo-400">Churnova Insight</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {customer.healthScore < 40
                                ? "Critical health drop detected. User engagement has fallen significantly below baseline. High risk of churn within the next 14 days without intervention."
                                : "Engagement remains stable. Normal seasonal variance observed. Recommend routine outreach to maintain satisfaction."
                            }
                        </p>
                        <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Recommended Action</p>
                            <p className="text-sm font-medium">Trigger "Retention Playbook V2"</p>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/8 p-6">
                        <h3 className="font-semibold text-sm mb-4">Metadata Traits</h3>
                        <div className="space-y-3">
                            {customer.metadata ? (
                                Object.entries(JSON.parse(customer.metadata)).map(([k, v]: any) => (
                                    <div key={k} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                        <span className="text-xs text-muted-foreground capitalize">{k}</span>
                                        <span className="text-xs font-mono font-medium">{v}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No custom traits identified.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Log */}
            <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <h3 className="font-semibold flex items-center gap-2">
                        <History className="w-4 h-4 text-blue-400" />
                        Activity Event Log
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left bg-muted/10 border-b border-border">
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Event</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Properties</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {customer.events?.map((event: any, i: number) => (
                                <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-sm font-medium">{event.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] bg-muted px-2 py-1 rounded-md text-muted-foreground font-mono">
                                            {event.properties || "{}"}
                                        </code>
                                    </td>
                                </tr>
                            ))}
                            {(!customer.events || customer.events.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                                        No events recorded for this customer yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
