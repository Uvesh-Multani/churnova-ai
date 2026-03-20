// Shared export utilities — all download buttons use these

interface UserRecord {
  id?: string;
  externalId?: string;
  name: string;
  email?: string;
  company?: string;
  plan?: string;
  riskScore?: number;
  riskLevel?: string;
  healthScore?: number;
  anomalyScore?: number;
  engagementDecline?: number;
  churnProbability?: number;
  mrr?: number;
  loginFrequency?: number;
  avgSessionDuration?: number;
  featureUsageRate?: number;
  lastActive?: string;
  lastSeen?: string;
  joinDate?: string;
  sessions?: number;
  aiInsight?: string;
}

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
}

function buildCsvRow(vals: unknown[]): string {
  return vals.map(escapeCsv).join(",");
}

function downloadCsv(rows: string[], filename: string) {
  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Full User Export ─────────────────────────────────────────────────────────

export function exportUsersCSV(users: UserRecord[], filenamePrefix = "churnova_users") {
  const headers = buildCsvRow([
    "User ID", "Name", "Email", "Company", "Plan",
    "Risk Score", "Risk Level", "Health Score",
    "Anomaly Score", "Churn Probability (%)",
    "Engagement Decline (%)", "MRR ($)",
    "Login Frequency (per week)", "Avg Session Duration (min)",
    "Feature Usage Rate (%)", "Sessions",
    "Last Active", "Join Date", "AI Insight"
  ]);

  const rows = users.map(u => buildCsvRow([
    u.externalId || u.id || "",
    u.name || "",
    u.email || "",
    u.company || "",
    u.plan || "",
    u.riskScore ?? u.healthScore ?? "",
    u.riskLevel || "",
    u.healthScore ?? "",
    u.anomalyScore ?? "",
    u.churnProbability ?? "",
    u.engagementDecline ?? "",
    u.mrr ?? "",
    u.loginFrequency ?? "",
    u.avgSessionDuration ?? "",
    u.featureUsageRate ?? "",
    u.sessions ?? "",
    u.lastActive || u.lastSeen || "",
    u.joinDate || "",
    u.aiInsight || "",
  ]));

  downloadCsv([headers, ...rows], `${filenamePrefix}_${dateSuffix()}.csv`);
}

// ─── High-Risk Only Export ────────────────────────────────────────────────────

export function exportHighRiskCSV(users: UserRecord[]) {
  const highRisk = users.filter(u => u.riskLevel === "High" || (u.riskScore != null && u.riskScore >= 71) || (u.healthScore != null && u.healthScore <= 30));
  exportUsersCSV(highRisk, "churnova_high_risk");
}

// ─── Analytics Summary Report CSV ────────────────────────────────────────────

export function exportAnalyticsSummaryCSV(analytics: {
  totalUsers: number;
  activeUsers: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
  revenueAtRisk: number;
  totalMrr: number;
  healthScore: number;
}) {
  const rows = [
    buildCsvRow(["Metric", "Value"]),
    buildCsvRow(["Total Users", analytics.totalUsers]),
    buildCsvRow(["Active Users (7d)", analytics.activeUsers]),
    buildCsvRow(["High Risk Users", analytics.highRiskUsers]),
    buildCsvRow(["Medium Risk Users", analytics.mediumRiskUsers]),
    buildCsvRow(["Low Risk Users", analytics.lowRiskUsers]),
    buildCsvRow(["Revenue at Risk ($)", analytics.revenueAtRisk.toFixed(2)]),
    buildCsvRow(["Total MRR ($)", analytics.totalMrr.toFixed(2)]),
    buildCsvRow(["Platform Health Score", analytics.healthScore]),
    buildCsvRow(["Report Generated", new Date().toISOString()]),
  ];
  downloadCsv(rows, `churnova_analytics_${dateSuffix()}.csv`);
}

// ─── Risk Report CSV ──────────────────────────────────────────────────────────

export function exportRiskReportCSV(users: UserRecord[]) {
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const min = i * 10;
    const max = (i + 1) * 10;
    const count = users.filter(u => {
      const score = u.riskScore ?? (100 - (u.healthScore ?? 50));
      return score >= min && score < max;
    }).length;
    return { range: `${min}-${max}`, count };
  });

  const rows = [
    buildCsvRow(["Risk Range", "User Count"]),
    ...buckets.map(b => buildCsvRow([b.range, b.count])),
    "",
    buildCsvRow(["Top 10 High-Risk Users"]),
    buildCsvRow(["Name", "Email", "Company", "Risk Score", "Anomaly", "Engagement Decline", "MRR", "AI Insight"]),
    ...users
      .filter(u => u.riskLevel === "High" || (u.riskScore ?? 0) >= 71)
      .slice(0, 10)
      .map(u => buildCsvRow([u.name, u.email, u.company, u.riskScore, u.anomalyScore, u.engagementDecline, u.mrr, u.aiInsight])),
  ];

  downloadCsv(rows.filter(r => r !== undefined) as string[], `churnova_risk_report_${dateSuffix()}.csv`);
}

// ─── Weekly Risk Summary CSV ──────────────────────────────────────────────────

export function exportWeeklyRiskSummaryCSV(analytics: ReturnType<typeof import("@/lib/data").getAnalytics>, users: UserRecord[]) {
  const highRisk = users.filter(u => u.riskLevel === "High" || (u.riskScore ?? 0) >= 71);
  const rows = [
    buildCsvRow(["Churnova AI — Weekly Risk Summary", `Generated: ${new Date().toLocaleString()}`]),
    "",
    buildCsvRow(["SUMMARY"]),
    buildCsvRow(["High Risk Users", analytics.highRiskUsers]),
    buildCsvRow(["Medium Risk Users", analytics.mediumRiskUsers]),
    buildCsvRow(["Revenue at Risk ($)", analytics.revenueAtRisk.toFixed(2)]),
    buildCsvRow(["Platform Health Score", analytics.healthScore]),
    "",
    buildCsvRow(["HIGH-RISK USER DETAILS"]),
    buildCsvRow(["Name", "Email", "Company", "Plan", "Risk Score", "Churn %", "MRR ($)", "Last Active", "AI Insight"]),
    ...highRisk.map(u => buildCsvRow([
      u.name, u.email, u.company, u.plan,
      u.riskScore ?? "", u.churnProbability ?? "",
      u.mrr ?? "", u.lastActive || u.lastSeen || "",
      u.aiInsight || ""
    ])),
  ];
  downloadCsv(rows, `churnova_weekly_risk_${dateSuffix()}.csv`);
}

// ─── Engagement Report CSV ────────────────────────────────────────────────────

export function exportEngagementReportCSV(users: UserRecord[]) {
  const rows = [
    buildCsvRow(["Churnova AI — Engagement Health Report", `Generated: ${new Date().toLocaleString()}`]),
    "",
    buildCsvRow(["User Engagement Detail"]),
    buildCsvRow(["Name", "Email", "Plan", "Sessions", "Login Frequency (wk)", "Avg Session (min)", "Feature Usage %", "Engagement Decline %", "Risk Level"]),
    ...users.map(u => buildCsvRow([
      u.name, u.email, u.plan,
      u.sessions ?? "", u.loginFrequency ?? "", u.avgSessionDuration ?? "",
      u.featureUsageRate ?? "", u.engagementDecline ?? "", u.riskLevel ?? ""
    ])),
  ];
  downloadCsv(rows, `churnova_engagement_${dateSuffix()}.csv`);
}

// ─── AI Insights CSV ─────────────────────────────────────────────────────────

export function exportAiInsightsCSV(users: UserRecord[]) {
  const flagged = users.filter(u => u.riskLevel === "High" || (u.riskScore ?? 0) >= 71 || (u.anomalyScore ?? 0) >= 0.6);
  const rows = [
    buildCsvRow(["Churnova AI — AI Insights Summary", `Generated: ${new Date().toLocaleString()}`]),
    "",
    buildCsvRow(["User ID", "Name", "Email", "Risk Level", "Anomaly Score", "Churn Probability %", "AI Insight / Recommendation"]),
    ...flagged.map(u => buildCsvRow([
      u.externalId || u.id || "", u.name, u.email,
      u.riskLevel ?? "", u.anomalyScore ?? "", u.churnProbability ?? "",
      u.aiInsight || "No insight generated"
    ])),
  ];
  downloadCsv(rows, `churnova_ai_insights_${dateSuffix()}.csv`);
}

// ─── Cohort Retention CSV ─────────────────────────────────────────────────────

export function exportCohortRetentionCSV(users: UserRecord[]) {
  const now = new Date();
  const cohorts = Array.from({ length: 6 }, (_, m) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - m), 1);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - (5 - m) + 1, 1);
    const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const cohortUsers = users.filter(u => {
      const created = new Date(u.joinDate || now);
      return created >= monthDate && created < nextMonthDate;
    });
    const size = cohortUsers.length;
    const healthyRate = size > 0
      ? cohortUsers.filter(u => (u.churnProbability ?? 50) < 50).length / size
      : 0.7;

    const available = m + 1;
    const retentionCols = Array.from({ length: 6 }, (_, col) => {
      if (col >= available) return "N/A";
      if (col === 0) return "100%";
      return `${Math.round(Math.max(0, Math.pow(healthyRate, col) * 95) * 100) / 100}%`;
    });
    return [label, size, ...retentionCols];
  });

  const rows = [
    buildCsvRow(["Churnova AI — Cohort Retention Report", `Generated: ${new Date().toLocaleString()}`]),
    "",
    buildCsvRow(["Cohort", "Users", "Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5"]),
    ...cohorts.map(c => buildCsvRow(c)),
  ];
  downloadCsv(rows, `churnova_cohort_retention_${dateSuffix()}.csv`);
}

// ─── Revenue at Risk CSV ──────────────────────────────────────────────────────

export function exportRevenueAtRiskCSV(users: UserRecord[]) {
  const planBreakdown = ["Free", "Basic", "Pro"].map(plan => {
    const planUsers = users.filter(u => u.plan === plan && (u.riskLevel === "High" || (u.riskScore ?? 0) >= 71));
    const revenue = planUsers.reduce((s, u) => s + (u.mrr ?? 0), 0);
    return { plan, count: planUsers.length, revenue };
  });

  const rows = [
    buildCsvRow(["Churnova AI — Revenue at Risk Report", `Generated: ${new Date().toLocaleString()}`]),
    "",
    buildCsvRow(["Plan", "High-Risk Users", "MRR at Risk ($)"]),
    ...planBreakdown.map(p => buildCsvRow([p.plan, p.count, p.revenue.toFixed(2)])),
    "",
    buildCsvRow(["INDIVIDUAL ACCOUNTS AT RISK"]),
    buildCsvRow(["Name", "Email", "Plan", "MRR ($)", "Risk Score", "Churn %", "Last Active", "AI Insight"]),
    ...users
      .filter(u => u.riskLevel === "High" || (u.riskScore ?? 0) >= 71)
      .sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0))
      .map(u => buildCsvRow([u.name, u.email, u.plan, u.mrr, u.riskScore, u.churnProbability, u.lastActive || u.lastSeen, u.aiInsight])),
  ];
  downloadCsv(rows, `churnova_revenue_at_risk_${dateSuffix()}.csv`);
}

// ─── Churn Forecast CSV ───────────────────────────────────────────────────────

export function exportChurnForecastCSV(users: UserRecord[]) {
  const sorted = [...users].sort((a, b) => (b.churnProbability ?? 0) - (a.churnProbability ?? 0));

  const rows = [
    buildCsvRow(["Churnova AI — Churn Forecast Report", `Generated: ${new Date().toLocaleString()}`]),
    "",
    buildCsvRow(["30-Day Window (All Users Sorted by Churn Probability)"]),
    buildCsvRow(["Name", "Email", "Plan", "Churn Probability (%)", "Risk Score", "Risk Level", "MRR ($)", "AI Insight"]),
    ...sorted.map(u => buildCsvRow([
      u.name, u.email, u.plan,
      u.churnProbability ?? "", u.riskScore ?? "", u.riskLevel ?? "",
      u.mrr ?? "", u.aiInsight ?? ""
    ])),
  ];
  downloadCsv(rows, `churnova_churn_forecast_${dateSuffix()}.csv`);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function dateSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}
