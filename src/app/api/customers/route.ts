import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const risk = searchParams.get("risk");
        const search = searchParams.get("search");

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Verify ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const where: any = { projectId };

        if (risk && risk !== "All") {
            where.riskLevel = risk;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { externalId: { contains: search } },
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { healthScore: "asc" },
            include: {
                _count: {
                    select: { events: true }
                }
            }
        });

        return NextResponse.json(customers);
    } catch (error: any) {
        console.error("Customers API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
