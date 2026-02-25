"use client";

import { motion } from "framer-motion";
import {
  FileText, Download, Calendar, Users, TrendingDown,
  BarChart3, CheckCircle, Clock, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { getAnalytics } from "@/lib/data";

const REPORTS = [
  {
    id: "weekly-risk",
    title: "Weekly Risk Summary",
    description: "Overview of risk score changes, new high-risk users, and revenue impact",
    type: "Automated",
    frequency: "Every Monday",
    lastGenerated: "2026-02-24",
    status: "Ready",
    size: "2.4 MB",
    icon: TrendingDown,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    id: "engagement",
    title: "Engagement Health Report",
    description: "Detailed engagement trends across all user cohorts with decline analysis",
    type: "Automated",
    frequency: "Monthly",
    lastGenerated: "2026-02-01",
    status: "Ready",
    size: "4.1 MB",
    icon: BarChart3,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    id: "churn-forecast",
    title: "Churn Forecast Report",
    description: "ML-generated churn predictions for the next 30/60/90 day windows",
    type: "On-Demand",
    frequency: "Manual",
    lastGenerated: "2026-02-20",
    status: "Ready",
    size: "1.8 MB",
    icon: Calendar,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    id: "user-cohorts",
    title: "User Cohort Analysis",
    description: "Retention curves and LTV breakdown by signup cohort and plan tier",
    type: "Automated",
    frequency: "Monthly",
    lastGenerated: "2026-02-01",
    status: "Generating",
    size: "—",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "revenue-risk",
    title: "Revenue at Risk Report",
    description: "MRR exposure analysis with per-account breakdown and urgency prioritization",
    type: "Automated",
    frequency: "Weekly",
    lastGenerated: "2026-02-17",
    status: "Ready",
    size: "3.2 MB",
    icon: TrendingDown,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    id: "ai-insights",
    title: "AI Insights Summary",
    description: "Aggregated AI-generated explanations for all flagged users with action recommendations",
    type: "On-Demand",
    frequency: "Manual",
    lastGenerated: "2026-02-22",
    status: "Ready",
    size: "5.6 MB",
    icon: FileText,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
];

export default function ReportsPage() {
  const { users } = useAppStore();
  const analytics = getAnalytics(users);

  const handleDownload = (reportTitle: string) => {
    toast.success(`Downloading ${reportTitle}`, {
      description: "Your PDF report is being prepared..."
    });
  };

  const handleSchedule = () => {
    toast.info("Report scheduling coming soon");
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Download and schedule AI-generated analytics reports
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gradient-bg text-white border-0 gap-2"
          onClick={handleSchedule}
        >
          <Plus className="w-3 h-3" />
          Schedule Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Reports Generated", value: "48", sub: "This month", icon: FileText },
          { label: "Users Analyzed", value: analytics.totalUsers.toString(), sub: "In latest run", icon: Users },
          { label: "High Risk Flags", value: analytics.highRiskUsers.toString(), sub: "Current snapshot", icon: TrendingDown },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl border border-white/8 p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <stat.icon className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {REPORTS.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2 }}
            className="glass-card rounded-2xl border border-white/8 hover:border-white/15 p-5 transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${report.bg} flex items-center justify-center flex-shrink-0`}>
                <report.icon className={`w-5 h-5 ${report.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-sm truncate">{report.title}</h3>
                  {report.status === "Generating" ? (
                    <Badge className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex-shrink-0">
                      <Clock className="w-2.5 h-2.5 mr-1 animate-spin" />
                      Generating
                    </Badge>
                  ) : (
                    <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20 flex-shrink-0">
                      <CheckCircle className="w-2.5 h-2.5 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{report.type}</span>
                <span>·</span>
                <span>{report.frequency}</span>
                <span>·</span>
                <span>{report.size !== "—" ? report.size : "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{report.lastGenerated}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 gap-1.5"
                  disabled={report.status === "Generating"}
                  onClick={() => handleDownload(report.title)}
                >
                  <Download className="w-3 h-3" />
                  PDF
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Email Simulation */}
      <div className="glass-card rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Email Digest Simulation</h3>
            <p className="text-xs text-muted-foreground">Simulate weekly churn risk email to your team</p>
          </div>
          <Button
            size="sm"
            className="ml-auto gradient-bg text-white border-0 text-xs h-8"
            onClick={() => toast.success("Weekly digest email sent to team@yourcompany.com", {
              description: `${analytics.highRiskUsers} high-risk users flagged in digest`
            })}
          >
            Send Test Email
          </Button>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-border pb-2 mb-3">
            <div className="w-6 h-6 rounded gradient-bg flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="font-semibold">Churnova AI Weekly Digest</p>
              <p className="text-muted-foreground">To: team@yourcompany.com · Feb 24, 2026</p>
            </div>
          </div>
          <p className="font-medium">This week&apos;s churn risk summary:</p>
          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
              <p className="text-red-400 font-bold text-base">{analytics.highRiskUsers}</p>
              <p className="text-muted-foreground">High Risk</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-2 text-center border border-yellow-500/20">
              <p className="text-yellow-400 font-bold text-base">{analytics.mediumRiskUsers}</p>
              <p className="text-muted-foreground">Medium Risk</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
              <p className="text-red-400 font-bold text-base">${analytics.revenueAtRisk.toLocaleString()}</p>
              <p className="text-muted-foreground">MRR at Risk</p>
            </div>
          </div>
          <p className="text-muted-foreground">View full report in your Churnova dashboard →</p>
        </div>
      </div>
    </div>
  );
}
