import { prisma } from "./prisma";

/**
 * Core Health Scoring Algorithm
 * Calculates a score from 0-100 based on user activity patterns.
 */
export async function calculateCustomerHealth(customerId: string) {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            events: {
                where: {
                    timestamp: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    },
                },
                orderBy: { timestamp: "desc" },
            },
        },
    });

    if (!customer) return 100;

    const events = customer.events;
    if (events.length === 0) {
        // No activity in last 30 days
        return 0;
    }

    // 1. Recency Score (Weight: 30%)
    const lastEventTime = events[0].timestamp.getTime();
    const daysSinceLastActive = (Date.now() - lastEventTime) / (24 * 60 * 60 * 1000);
    const recencyScore = Math.max(0, 100 - (daysSinceLastActive * 10)); // Drastic drop after 10 days of silence

    // 2. Frequency Score (Weight: 40%)
    // Group events by day to see active day count
    const activeDays = new Set(events.map(e => e.timestamp.toISOString().split("T")[0])).size;
    const frequencyScore = Math.min(100, (activeDays / 30) * 300); // 10 active days in a month = 100 frequency score

    // 3. Volume Score (Weight: 30%)
    const eventVolumeBucket = events.length;
    const volumeScore = Math.min(100, (eventVolumeBucket / 100) * 100); // 100 events in a month = 100 volume score

    // Weighted Total
    const totalScore = Math.round(
        (recencyScore * 0.3) +
        (frequencyScore * 0.4) +
        (volumeScore * 0.3)
    );

    const finalScore = Math.min(100, Math.max(0, totalScore));

    // Determine risk level
    let riskLevel = "Low";
    if (finalScore < 30) riskLevel = "High"; // Syncing with alert threshold
    else if (finalScore < 70) riskLevel = "Medium";

    const oldScore = customer.healthScore || 100;

    // Update customer record
    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            healthScore: finalScore,
            riskLevel,
        },
    });

    // Trigger Smart Alerts
    const { alerts } = await import("./alerts");
    await alerts.notifyRiskChange(customer.projectId, customer.id, oldScore, finalScore);

    // Log historical score
    await prisma.healthScore.create({
        data: {
            score: finalScore,
            customerId: customer.id,
        },
    });

    return finalScore;
}
