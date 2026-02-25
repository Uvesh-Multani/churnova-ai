import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const search = searchParams.get("search") || "";

        if (!projectId) {
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        const customers = await prisma.customer.findMany({
            where: {
                projectId,
                OR: [
                    { email: { contains: search } },
                    { name: { contains: search } },
                    { externalId: { contains: search } },
                    { company: { contains: search } },
                ],
            },
            orderBy: { healthScore: "asc" }, // Show riskiest first
            include: {
                _count: {
                    select: { events: true }
                }
            }
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Customers API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
