import { prisma } from "../src/lib/prisma";

const COMPANIES = [
    "Acme Corp", "TechFlow Inc", "DataSync", "CloudBase", "NexGen Solutions",
    "Vertex Labs", "Quantum Systems", "Orbit Digital", "Pulse Analytics",
    "Zenith Software", "Apex Ventures", "Nomad Tools", "Spark Technologies",
    "Nova Networks", "Prism Data", "Cascade AI", "Summit Tech", "Horizon SaaS",
    "Eclipse Systems", "Fusion Analytics",
];

const FIRST_NAMES = ["Alex", "Jordan", "Morgan", "Casey", "Riley", "Taylor", "Drew", "Sam", "Chris", "Jamie", "Avery", "Blake", "Quinn", "Devon", "Parker", "Skyler", "Reese", "Finley", "Rowan", "Sage"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Allen", "King", "Wright"];

const INSIGHTS = {
    High: [
        "User engagement declined by {d}% over the last 30 days with reduced feature interaction.",
        "Critical drop in session frequency detected. Feature adoption rate fell {d}% month-over-month.",
        "Anomalous behavior detected: {d}% fewer logins than baseline. Usage pattern diverges significantly.",
        "Engagement trend shows consistent {d}% weekly decline. Support ticket volume increased.",
    ],
    Medium: [
        "Moderate engagement decline of {d}% observed. Feature usage rate dropped below average.",
        "Session duration decreasing trend over 3 weeks ({d}% decline). User has not explored new features.",
        "Login frequency reduced by {d}% compared to previous month. Some core feature usage maintained.",
    ],
    Low: [
        "User shows healthy engagement patterns with only {d}% minor variance. Core features actively used.",
        "Consistent usage patterns detected. Minor {d}% seasonal variation in activity.",
        "Active user with regular session cadence. Strong platform adoption observed.",
    ],
};

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateInsight(riskLevel: "Low" | "Medium" | "High", decline: number): string {
    const templates = INSIGHTS[riskLevel];
    const template = templates[randomBetween(0, templates.length - 1)];
    return template.replace("{d}", String(decline));
}

async function main() {
    console.log("Starting dataset generation...");

    // Get or create a default project
    let project = await prisma.project.findFirst();
    if (!project) {
        console.log("No projects found. Creating a default project...");
        project = await prisma.project.create({
            data: {
                name: "Default Project",
                ownerId: "user_dev",
                apiKeys: {
                    create: {
                        name: "Development Key",
                        key: `ch_dev_${Math.random().toString(36).substring(7)}`
                    }
                }
            }
        });
    }

    const projectId = project.id;
    const count = 2000;

    console.log(`Generating ${count} customers for project ${projectId}...`);

    const customersToInsert = [];

    for (let i = 0; i < count; i++) {
        const firstName = FIRST_NAMES[randomBetween(0, FIRST_NAMES.length - 1)];
        const lastName = LAST_NAMES[randomBetween(0, LAST_NAMES.length - 1)];
        const name = `${firstName} ${lastName}`;
        const company = COMPANIES[randomBetween(0, COMPANIES.length - 1)];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomBetween(1, 999)}@${company.toLowerCase().replace(/ /g, "")}.com`;

        const riskRoll = Math.random();
        let riskLevel: "Low" | "Medium" | "High";
        let riskScore: number;
        let anomalyScore: number;
        let loginFrequency: number;
        let avgSessionDuration: number;
        let featureUsageRate: number;
        let churnProbability: number;
        let engagementDecline: number;
        let plan: string;
        let mrr: number;
        let subscriptionStatus: string;

        // Pricing plans
        const plans = [
            { name: "Starter", mrr: randomBetween(29, 49) },
            { name: "Pro", mrr: randomBetween(99, 199) },
            { name: "Enterprise", mrr: randomBetween(499, 2000) }
        ];
        const planChoice = plans[randomBetween(0, plans.length - 1)];
        plan = planChoice.name;
        mrr = planChoice.mrr;

        if (riskRoll < 0.25) {
            riskLevel = "High";
            riskScore = randomBetween(71, 98);
            anomalyScore = randomFloat(0.6, 0.95);
            engagementDecline = randomBetween(35, 75);
            loginFrequency = randomFloat(0.2, 1.5);
            avgSessionDuration = randomBetween(3, 12);
            featureUsageRate = randomFloat(5, 25);
            churnProbability = randomBetween(65, 95);
        } else if (riskRoll < 0.60) {
            riskLevel = "Medium";
            riskScore = randomBetween(41, 70);
            anomalyScore = randomFloat(0.3, 0.6);
            engagementDecline = randomBetween(15, 35);
            loginFrequency = randomFloat(1.5, 4);
            avgSessionDuration = randomBetween(12, 25);
            featureUsageRate = randomFloat(25, 60);
            churnProbability = randomBetween(30, 65);
        } else {
            riskLevel = "Low";
            riskScore = randomBetween(5, 40);
            anomalyScore = randomFloat(0.05, 0.3);
            engagementDecline = randomBetween(0, 15);
            loginFrequency = randomFloat(4, 12);
            avgSessionDuration = randomBetween(25, 60);
            featureUsageRate = randomFloat(60, 95);
            churnProbability = randomBetween(5, 30);
        }

        // Determine subscription status
        subscriptionStatus = (riskLevel === "High" && Math.random() < 0.3) ? "canceled" : "active";

        let cancelDate = null;
        if (subscriptionStatus === "canceled") {
            cancelDate = new Date();
            cancelDate.setDate(cancelDate.getDate() - randomBetween(1, 14));
            // if canceled, mrr is lost, effectively making current billing cycle inactive, but we keep MRR to calculate 'lost mrr'
        }

        const aiInsight = generateInsight(riskLevel, engagementDecline);
        const healthScore = 100 - riskScore;

        const daysSinceActive = riskLevel === "High"
            ? randomBetween(10, 45)
            : riskLevel === "Medium"
                ? randomBetween(3, 15)
                : randomBetween(0, 5);

        const lastSeen = new Date();
        lastSeen.setDate(lastSeen.getDate() - daysSinceActive);

        const createdAt = new Date();
        createdAt.setMonth(createdAt.getMonth() - randomBetween(3, 24));

        customersToInsert.push({
            externalId: `USR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            email,
            name,
            company,
            lastSeen,
            healthScore,
            riskLevel,
            anomalyScore,
            loginFrequency,
            avgSessionDuration,
            featureUsageRate,
            churnProbability,
            aiInsight,
            plan,
            mrr,
            subscriptionStatus,
            cancelDate,
            billingCycle: "monthly",
            projectId,
            createdAt,
        });
    }

    // Insert in batches of 500 to avoid SQLite limits
    const batchSize = 500;
    for (let i = 0; i < customersToInsert.length; i += batchSize) {
        const batch = customersToInsert.slice(i, i + batchSize);
        await prisma.customer.createMany({
            data: batch,
        });
        console.log(`Inserted batch ${i / batchSize + 1} / ${Math.ceil(customersToInsert.length / batchSize)}`);
    }

    console.log("Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
