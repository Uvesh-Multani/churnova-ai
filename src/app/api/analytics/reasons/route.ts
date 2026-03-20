import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        // Fetch AI insights directly from High Risk customers
        const highRiskCustomers = await prisma.customer.findMany({
            where: {
                projectId,
                riskLevel: "High",
                aiInsight: {
                    not: null,
                }
            },
            select: {
                aiInsight: true,
            }
        });

        if (highRiskCustomers.length === 0) {
            return NextResponse.json({ reasons: [] });
        }

        // Aggregate occurrences of similar insights
        const reasonCounts: Record<string, number> = {};
        let totalCount = 0;

        highRiskCustomers.forEach(customer => {
            if (customer.aiInsight) {
                // ... same logic as before ...
                
                let category = "Unknown Context";
                const text = customer.aiInsight;

                if (text.includes("feature adoption") || text.includes("Feature usage is declining")) {
                    category = "Declining Feature Adoption";
                } else if (text.includes("cadence has dropped") || text.includes("Irregular login patterns")) {
                    category = "Irregular Login Cadence";
                } else if (text.includes("short, indicating") || text.includes("Session lengths are trending downward")) {
                    category = "Decreasing Session Duration";
                } else if (text.includes("Anomalous behavior")) {
                    category = "Anomalous Usage Pattern";
                }

                reasonCounts[category] = (reasonCounts[category] || 0) + 1;
                totalCount++;
            }
        });

        // Format as Top Reasons with percentages
        const topReasons = Object.entries(reasonCounts)
            .map(([reason, count]) => ({
                reason,
                percentage: Math.round((count / totalCount) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage);

        return NextResponse.json({
            reasons: topReasons
        });

    } catch (error) {
        console.error("Reasons Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
