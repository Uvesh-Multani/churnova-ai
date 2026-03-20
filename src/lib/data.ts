// Sample data generator for Churnova AI
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  anomalyScore: number;
  engagementDecline: number;
  recencyScore: number;
  lastActive: string;
  loginFrequency: number;
  avgSessionDuration: number;
  featureUsageRate: number;
  aiInsight: string;
  churnProbability: number;
  mrr: number;
  joinDate: string;
  sessions: number;
  engagementHistory?: { date: string; value: number }[];
}

const COMPANIES = [
  "Acme Corp", "TechFlow Inc", "DataSync", "CloudBase", "NexGen Solutions",
  "Vertex Labs", "Quantum Systems", "Orbit Digital", "Pulse Analytics",
  "Zenith Software", "Apex Ventures", "Nomad Tools", "Spark Technologies",
  "Nova Networks", "Prism Data", "Cascade AI", "Summit Tech", "Horizon SaaS",
  "Eclipse Systems", "Fusion Analytics",
];

const PLANS = ["Free", "Basic", "Pro"];

const INSIGHTS = {
  High: [
    "User engagement declined by {d}% over the last 30 days with reduced feature interaction. Inactivity duration increased by {i}%. Model confidence: {c}%.",
    "Critical drop in session frequency detected. Feature adoption rate fell {d}% month-over-month. Last login was {days} days ago. Churn probability is high.",
    "Anomalous behavior detected: {d}% fewer logins than baseline. Usage pattern diverges significantly from similar users. Immediate outreach recommended.",
    "Engagement trend shows consistent {d}% weekly decline. Support ticket volume increased {i}%. High churn risk identified by isolation forest model.",
  ],
  Medium: [
    "Moderate engagement decline of {d}% observed. Feature usage rate dropped below average. Recency score indicates reduced platform dependency.",
    "Session duration decreasing trend over 3 weeks ({d}% decline). User has not explored new features. Consider proactive check-in.",
    "Login frequency reduced by {d}% compared to previous month. Some core feature usage maintained. Medium-term churn risk detected.",
  ],
  Low: [
    "User shows healthy engagement patterns with only {d}% minor variance. Core features actively used. Low churn risk.",
    "Consistent usage patterns detected. Minor {d}% seasonal variation in activity. No immediate risk signals.",
    "Active user with regular session cadence. {d}% engagement within normal range. Strong platform adoption observed.",
  ],
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateEngagementHistory(riskLevel: "Low" | "Medium" | "High"): { date: string; value: number }[] {
  const history = [];
  const today = new Date();
  let baseValue = randomBetween(60, 95);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    let variance = 0;
    if (riskLevel === "High") {
      variance = -randomFloat(1, 4); // consistent decline
    } else if (riskLevel === "Medium") {
      variance = -randomFloat(0.2, 1.5);
    } else {
      variance = randomFloat(-1, 1.5);
    }

    baseValue = Math.max(5, Math.min(100, baseValue + variance));
    history.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(baseValue),
    });
  }

  return history;
}

function generateInsight(riskLevel: "Low" | "Medium" | "High", decline: number): string {
  const templates = INSIGHTS[riskLevel];
  const template = templates[randomBetween(0, templates.length - 1)];
  return template
    .replace("{d}", String(decline))
    .replace("{i}", String(randomBetween(10, 30)))
    .replace("{c}", String(randomBetween(75, 95)))
    .replace("{days}", String(randomBetween(8, 25)));
}

export function generateUsers(count: number = 100): UserRecord[] {
  const users: UserRecord[] = [];
  const firstNames = ["Alex", "Jordan", "Morgan", "Casey", "Riley", "Taylor", "Drew", "Sam", "Chris", "Jamie", "Avery", "Blake", "Quinn", "Devon", "Parker", "Skyler", "Reese", "Finley", "Rowan", "Sage"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Allen", "King", "Wright"];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[randomBetween(0, firstNames.length - 1)];
    const lastName = lastNames[randomBetween(0, lastNames.length - 1)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomBetween(1, 99)}@${COMPANIES[randomBetween(0, COMPANIES.length - 1)].toLowerCase().replace(/ /g, "")}.com`;
    const company = COMPANIES[randomBetween(0, COMPANIES.length - 1)];
    const plan = PLANS[randomBetween(0, PLANS.length - 1)];

    // Controlled risk distribution: ~30% high, 40% medium, 30% low
    const riskRoll = Math.random();
    let riskLevel: "Low" | "Medium" | "High";
    let riskScore: number;
    let anomalyScore: number;
    let engagementDecline: number;
    let recencyScore: number;

    if (riskRoll < 0.3) {
      riskLevel = "High";
      riskScore = randomBetween(71, 98);
      anomalyScore = randomFloat(0.6, 0.95);
      engagementDecline = randomBetween(35, 75);
      recencyScore = randomFloat(0.1, 0.4);
    } else if (riskRoll < 0.7) {
      riskLevel = "Medium";
      riskScore = randomBetween(41, 70);
      anomalyScore = randomFloat(0.3, 0.6);
      engagementDecline = randomBetween(15, 35);
      recencyScore = randomFloat(0.4, 0.7);
    } else {
      riskLevel = "Low";
      riskScore = randomBetween(5, 40);
      anomalyScore = randomFloat(0.05, 0.3);
      engagementDecline = randomBetween(0, 15);
      recencyScore = randomFloat(0.7, 1.0);
    }

    const daysSinceActive = riskLevel === "High"
      ? randomBetween(10, 45)
      : riskLevel === "Medium"
        ? randomBetween(3, 15)
        : randomBetween(0, 5);

    const lastActive = new Date();
    lastActive.setDate(lastActive.getDate() - daysSinceActive);

    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - randomBetween(3, 24));

    const mrrByPlan: Record<string, number> = {
      Free: 0,
      Basic: 4.99,
      Pro: 12.99,
    };

    users.push({
      id: `USR-${String(i + 1).padStart(4, "0")}`,
      name,
      email,
      company,
      plan,
      riskScore,
      riskLevel,
      anomalyScore: Math.round(anomalyScore * 100) / 100,
      engagementDecline,
      recencyScore: Math.round(recencyScore * 100) / 100,
      lastActive: lastActive.toISOString().split("T")[0],
      loginFrequency: riskLevel === "High" ? randomFloat(0.2, 1.5) : riskLevel === "Medium" ? randomFloat(1.5, 4) : randomFloat(4, 12),
      avgSessionDuration: riskLevel === "High" ? randomBetween(3, 12) : riskLevel === "Medium" ? randomBetween(12, 25) : randomBetween(25, 60),
      featureUsageRate: riskLevel === "High" ? randomFloat(5, 25) : riskLevel === "Medium" ? randomFloat(25, 60) : randomFloat(60, 95),
      aiInsight: generateInsight(riskLevel, engagementDecline),
      churnProbability: riskLevel === "High" ? randomBetween(65, 95) : riskLevel === "Medium" ? randomBetween(30, 65) : randomBetween(5, 30),
      mrr: mrrByPlan[plan],
      joinDate: joinDate.toISOString().split("T")[0],
      sessions: riskLevel === "High" ? randomBetween(1, 8) : riskLevel === "Medium" ? randomBetween(8, 30) : randomBetween(30, 120),
      engagementHistory: generateEngagementHistory(riskLevel),
    });
  }

  return users.sort((a, b) => b.riskScore - a.riskScore);
}

// Pre-generate dataset
export const sampleUsers = generateUsers(120);

// Analytics aggregates
export function getAnalytics(users: UserRecord[]) {
  const highRisk = users.filter(u => u.riskLevel === "High");
  const mediumRisk = users.filter(u => u.riskLevel === "Medium");
  const lowRisk = users.filter(u => u.riskLevel === "Low");
  const activeUsers = users.filter(u => {
    const lastActive = new Date(u.lastActive);
    const daysDiff = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  const revenueAtRisk = highRisk.reduce((sum, u) => sum + u.mrr, 0);
  const totalMrr = users.reduce((sum, u) => sum + u.mrr, 0);
  const healthScore = Math.round(
    ((lowRisk.length * 100 + mediumRisk.length * 50 + highRisk.length * 10) /
      (users.length * 100)) * 100
  );

  return {
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    highRiskUsers: highRisk.length,
    mediumRiskUsers: mediumRisk.length,
    lowRiskUsers: lowRisk.length,
    revenueAtRisk,
    totalMrr,
    healthScore,
    riskDistribution: [
      { name: "High Risk", value: highRisk.length, color: "#ef4444" },
      { name: "Medium Risk", value: mediumRisk.length, color: "#eab308" },
      { name: "Low Risk", value: lowRisk.length, color: "#22c55e" },
    ],
  };
}

// Generate engagement timeline data dynamically based on users
export function getEngagementTimeline(users: UserRecord[]): { date: string; engagement: number; sessions: number; newUsers: number }[] {
  const data = [];
  const today = new Date();

  // Calculate base metrics from actual active project users
  const avgEngagement = users.length > 0
    ? users.reduce((sum, u) => sum + (100 - u.riskScore), 0) / users.length
    : 72;
  const totalMonthlySessions = users.reduce((sum, u) => sum + (u.sessions || 0), 0) || 250;

  let baseEngagementVal = avgEngagement;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Slight jitter to make chart look alive, anchored around real user averages
    baseEngagementVal += randomFloat(-1.5, 1.5);
    baseEngagementVal = Math.max(10, Math.min(100, baseEngagementVal));

    // Interpolating back towards true average daily
    if (Math.abs(baseEngagementVal - avgEngagement) > 10) {
      baseEngagementVal += (avgEngagement - baseEngagementVal) * 0.1;
    }

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      engagement: Math.round(baseEngagementVal),
      sessions: Math.round((totalMonthlySessions / 30) + randomBetween(-5, 15)),
      newUsers: randomBetween(0, Math.ceil(users.length / 30) + 2),
    });
  }

  return data;
}

// Feature usage data based on user metrics
export function getFeatureUsage(users: UserRecord[]) {
  if (users.length === 0) {
    return [
      { feature: "Dashboard", usage: 0, prev: 0 },
      { feature: "Analytics", usage: 0, prev: 0 },
      { feature: "Reports", usage: 0, prev: 0 },
      { feature: "Integrations", usage: 0, prev: 0 },
      { feature: "API Access", usage: 0, prev: 0 },
      { feature: "Automation", usage: 0, prev: 0 },
      { feature: "Exports", usage: 0, prev: 0 },
      { feature: "Alerts", usage: 0, prev: 0 },
    ];
  }

  const avgFeatureRate = users.reduce((sum, u) => sum + (u.featureUsageRate || 0), 0) / users.length;

  return [
    { feature: "Dashboard", usage: Math.min(100, Math.round(avgFeatureRate * 1.3)), prev: Math.min(100, Math.round(avgFeatureRate * 1.35)) },
    { feature: "Analytics", usage: Math.min(100, Math.round(avgFeatureRate * 1.1)), prev: Math.min(100, Math.round(avgFeatureRate * 1.05)) },
    { feature: "Reports", usage: Math.min(100, Math.round(avgFeatureRate * 0.9)), prev: Math.round(avgFeatureRate * 0.92) },
    { feature: "Integrations", usage: Math.round(avgFeatureRate * 0.7), prev: Math.round(avgFeatureRate * 0.65) },
    { feature: "API Access", usage: Math.round(avgFeatureRate * 0.6), prev: Math.round(avgFeatureRate * 0.58) },
    { feature: "Automation", usage: Math.round(avgFeatureRate * 0.5), prev: Math.round(avgFeatureRate * 0.6) },
    { feature: "Exports", usage: Math.round(avgFeatureRate * 0.4), prev: Math.round(avgFeatureRate * 0.45) },
    { feature: "Alerts", usage: Math.round(avgFeatureRate * 0.3), prev: Math.round(avgFeatureRate * 0.28) },
  ];
}

// Anomaly scatter data
export function getAnomalyData(users: UserRecord[]) {
  return users.slice(0, 80).map(u => ({
    id: u.id,
    x: u.loginFrequency,
    y: u.avgSessionDuration,
    z: u.anomalyScore,
    risk: u.riskLevel,
    name: u.name,
  }));
}
