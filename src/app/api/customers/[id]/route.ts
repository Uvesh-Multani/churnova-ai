import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                events: {
                    orderBy: { timestamp: "desc" },
                    take: 50,
                },
                healthHistory: {
                    orderBy: { timestamp: "desc" },
                    take: 30,
                },
                project: true,
            },
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Verify project ownership
        if (customer.project.ownerId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json(customer);
    } catch (error: any) {
        console.error("Customer Detail API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
