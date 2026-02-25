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

        // Simulate MRR if not present in schema for now
        const revenueAtRisk = customers
            .filter(c => c.riskLevel === "High")
            .length * 99; // Assume $99 average fallback

        const totalMrr = customers.length * 99;

        const healthScore = customers.length > 0
            ? Math.round(customers.reduce((acc, c) => acc + (c.healthScore || 0), 0) / customers.length)
            : 100;

        return NextResponse.json({
            totalUsers: customers.length,
            activeUsers: customers.filter(c => {
                const diff = Date.now() - (c.lastSeen?.getTime() || 0);
                return diff < 7 * 24 * 60 * 60 * 1000;
            }).length,
            highRiskUsers: highRisk,
            mediumRiskUsers: mediumRisk,
            lowRiskUsers: lowRisk,
            revenueAtRisk,
            totalMrr,
            healthScore,
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
