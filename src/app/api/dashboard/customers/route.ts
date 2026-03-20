import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.error("[Dashboard Customers API] Missing Clerk userId (Unauthorized 401)");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const search = searchParams.get("search") || "";

        if (!projectId) {
            console.error("[Dashboard Customers API] Missing projectId in URL query (400)");
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.ownerId !== userId) {
            console.error(`[Dashboard Customers API] Project ${projectId} not found or ownerId (${project?.ownerId}) mismatch with userId (${userId})`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
        }

        const where: any = { projectId };
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { name: { contains: search } },
                { externalId: { contains: search } },
                { company: { contains: search } },
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { healthScore: "asc" }, // Show riskiest first
            include: {
                _count: {
                    select: { events: true }
                }
            }
        });

        console.log(`[Dashboard Customers API] Found ${customers.length} customers for Project ${projectId}`);

        // Map the real DB objects to the UI format.
        const users = customers.map((c) => ({
            id: c.externalId,
            name: c.name || "Unknown User",
            email: c.email || "",
            company: c.company || "Unknown Company",
            plan: c.plan || "Free",
            riskScore: 100 - (c.healthScore || 100), // Risk is inverse of health
            riskLevel: c.riskLevel || "Low",
            anomalyScore: c.anomalyScore || 0,
            engagementDecline: c.churnProbability ? c.churnProbability * 0.5 : 0,
            recencyScore: 0.8,
            lastActive: c.lastSeen ? c.lastSeen.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            loginFrequency: c.loginFrequency || 0,
            avgSessionDuration: c.avgSessionDuration || 0,
            featureUsageRate: c.featureUsageRate || 0,
            aiInsight: c.aiInsight || "No specific ML insight generated.",
            churnProbability: c.churnProbability || 0,
            mrr: c.mrr || 0,
            joinDate: c.createdAt.toISOString().split("T")[0],
            sessions: c.loginFrequency ? Math.round(c.loginFrequency * 4) : 0, // Approx total monthly sessions
        }));

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Customers API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
