import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        const customers = await prisma.customer.findMany({
            where: { projectId },
            include: {
                _count: {
                    select: { events: true }
                }
            }
        });

        const highRisk = customers.filter(c => c.riskLevel === "High").length;
        const mediumRisk = customers.filter(c => c.riskLevel === "Medium").length;
        const lowRisk = customers.filter(c => c.riskLevel === "Low").length;

        // Accurate MRR calculation
        const activeCustomers = customers.filter(c => c.subscriptionStatus === "active");
        const canceledCustomersThisMonth = customers.filter(c =>
            c.subscriptionStatus === "canceled" &&
            c.cancelDate &&
            c.cancelDate.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        );

        const revenueAtRisk = activeCustomers
            .filter(c => c.riskLevel === "High")
            .reduce((acc, c) => acc + (c.mrr || 0), 0);

        const totalMrr = activeCustomers.reduce((acc, c) => acc + (c.mrr || 0), 0);

        // Churn calculation
        const churnRateMonth = customers.length > 0
            ? (canceledCustomersThisMonth.length / customers.length) * 100
            : 0;

        const healthScore = activeCustomers.length > 0
            ? Math.round(activeCustomers.reduce((acc, c) => acc + (c.healthScore || 0), 0) / activeCustomers.length)
            : 100;

        return NextResponse.json({
            totalUsers: activeCustomers.length,
            activeUsers: activeCustomers.filter(c => {
                const diff = Date.now() - (c.lastSeen?.getTime() || 0);
                return diff < 7 * 24 * 60 * 60 * 1000;
            }).length,
            highRiskUsers: highRisk,
            mediumRiskUsers: mediumRisk,
            lowRiskUsers: lowRisk,
            revenueAtRisk,
            totalMrr,
            healthScore,
            churn: {
                current: parseFloat(churnRateMonth.toFixed(1)),
                industryAverage: 4.2,
                topSaaS: 2.5
            },
            riskDistribution: [
                { name: "High Risk", value: highRisk, color: "#ef4444" },
                { name: "Medium Risk", value: mediumRisk, color: "#eab308" },
                { name: "Low Risk", value: lowRisk, color: "#22c55e" },
            ],
        });
    } catch (error) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
