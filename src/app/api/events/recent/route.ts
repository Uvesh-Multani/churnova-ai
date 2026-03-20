import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Project ID required" }, { status: 400 });
        }

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, ownerId: userId }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        // Fetch recent events
        const recentEvents = await prisma.event.findMany({
            where: {
                customer: {
                    projectId: projectId
                },
                isDeleted: false
            },
            include: {
                customer: true
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 10
        }) as any[];

        // Fetch high risk customers to create "virtual" notifications
        const riskAlerts = await prisma.customer.findMany({
            where: {
                projectId: projectId,
                OR: [
                    { riskLevel: "High" },
                    { riskLevel: "Critical" },
                    { anomalyScore: { gt: 0.7 } }
                ]
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 5
        });

        // Map events to format expected by the frontend
        const formattedEvents = recentEvents.map(event => {
            const timeDiff = Date.now() - new Date(event.timestamp).getTime();
            const minutes = Math.floor(timeDiff / 60000);
            let timeStr = "just now";
            if (minutes > 0 && minutes < 60) timeStr = `${minutes}m ago`;
            else if (minutes >= 60 && minutes < 1440) timeStr = `${Math.floor(minutes / 60)}h ago`;
            else if (minutes >= 1440) timeStr = `${Math.floor(minutes / 1440)}d ago`;

            let type = "low";
            const eventNameLower = event.name.toLowerCase();
            if (eventNameLower.includes("anomaly") || eventNameLower.includes("risk") || eventNameLower.includes("churn")) {
                type = "high";
            } else if (eventNameLower.includes("dropped") || eventNameLower.includes("decreased")) {
                type = "medium";
            }

            return {
                id: event.id,
                user: event.customer?.name || event.customer?.externalId || "Unknown User",
                action: event.name,
                time: timeStr,
                type: type,
                timestamp: event.timestamp,
                isRead: event.isRead
            };
        });

        // Add risk alerts
        const formattedAlerts = riskAlerts.map(customer => {
            const timeDiff = Date.now() - new Date(customer.updatedAt).getTime();
            const minutes = Math.floor(timeDiff / 60000);
            let timeStr = "just now";
            if (minutes > 0 && minutes < 60) timeStr = `${minutes}m ago`;
            else if (minutes >= 60 && minutes < 1440) timeStr = `${Math.floor(minutes / 60)}h ago`;
            else if (minutes >= 1440) timeStr = `${Math.floor(minutes / 1440)}d ago`;

            const isHighAnomaly = (customer.anomalyScore || 0) > 0.7;
            const action = isHighAnomaly 
                ? `Unusual behavior detected (Score: ${customer.anomalyScore?.toFixed(2)})`
                : `Customer flagged as ${customer.riskLevel} Risk`;

            return {
                id: `alert-${customer.id}`,
                user: customer.name || customer.externalId,
                action: action,
                time: timeStr,
                type: "high",
                timestamp: customer.updatedAt
            };
        });

        // Merge and sort
        const allNotifications = [...formattedEvents, ...formattedAlerts]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return NextResponse.json(allNotifications);

    } catch (error: any) {
        console.error("Recent Events API Error:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
