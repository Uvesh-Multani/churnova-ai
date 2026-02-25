import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        // Get event counts for the last 30 days grouped by day
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const events = await prisma.event.findMany({
            where: {
                customer: { projectId },
                timestamp: { gte: thirtyDaysAgo },
            },
            select: { timestamp: true },
        });

        // Group events by date
        const dailyEvents: Record<string, number> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dailyEvents[key] = 0;
        }

        events.forEach(event => {
            const key = event.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (dailyEvents[key] !== undefined) {
                dailyEvents[key]++;
            }
        });

        const chartData = Object.entries(dailyEvents).map(([date, count]) => ({
            date,
            engagement: Math.min(100, Math.round((count / 10))), // Simple heuristic
            sessions: Math.round(count / 2),
            newUsers: Math.floor(count / 20),
        }));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error("Charts API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
