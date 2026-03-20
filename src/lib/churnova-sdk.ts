import { prisma } from "./prisma";
import { calculateCustomerHealth } from "./intelligence";

/**
 * Churnova Backend client - used internally by the server
 */
export const churnova = {
    async track(apiKey: string, customerId: string, event: string, properties: any = {}) {
        const projectKey = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { project: true }
        });
        const project = projectKey?.project;

        if (!project) throw new Error("Invalid API Key");

        const customer = await prisma.customer.upsert({
            where: {
                projectId_externalId: {
                    projectId: project.id,
                    externalId: customerId
                }
            },
            update: { lastSeen: new Date() },
            create: {
                externalId: customerId,
                projectId: project.id,
                name: `User ${customerId}`,
                lastSeen: new Date()
            },
        });

        const newEvent = await prisma.event.create({
            data: {
                name: event,
                properties: JSON.stringify(properties),
                customerId: customer.id,
            },
        });

        // Automatically trigger health calculation
        await calculateCustomerHealth(customer.id);

        return newEvent;
    },

    async identify(apiKey: string, customerId: string, data: any) {
        const projectKey = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { project: true }
        });
        const project = projectKey?.project;

        if (!project) throw new Error("Invalid API Key");

        const customer = await prisma.customer.upsert({
            where: {
                projectId_externalId: {
                    projectId: project.id,
                    externalId: customerId
                }
            },
            update: { ...data, lastSeen: new Date() },
            create: { ...data, externalId: customerId, projectId: project.id, name: data.name || `User ${customerId}`, lastSeen: new Date() },
        });

        return customer;
    },

    async applyHealthDecay() {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Find all customers who haven't been seen in the last 24 hours
        const inactiveCustomers = await prisma.customer.findMany({
            where: {
                lastSeen: {
                    lt: yesterday
                },
                healthScore: {
                    gt: 0 // Only decay if they have some health left
                }
            }
        });

        const updates = inactiveCustomers.map(async (customer) => {
            const lastSeen = customer.lastSeen || customer.createdAt;
            const daysInactive = Math.floor((now.getTime() - lastSeen.getTime()) / (24 * 60 * 60 * 1000));

            // Decay 5 points per day of inactivity
            const decayAmount = daysInactive * 5;
            const newScore = Math.max(0, (customer.healthScore || 100) - decayAmount);

            const oldScore = customer.healthScore || 100;

            // Update health score and add to history
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    healthScore: newScore,
                    riskLevel: newScore < 30 ? "High" : newScore < 70 ? "Medium" : "Low",
                    healthHistory: {
                        create: { score: newScore }
                    }
                }
            });

            // Trigger Smart Alerts
            const { alerts } = await import("./alerts");
            await alerts.notifyRiskChange(customer.projectId, customer.id, oldScore, newScore);
        });

        await Promise.all(updates);
        return { processed: inactiveCustomers.length };
    }
};
