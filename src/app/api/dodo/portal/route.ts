import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dodo } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        if (!project.dodoCustomerId) {
            return NextResponse.json({ error: "No active subscription found for this project" }, { status: 400 });
        }

        // Generate Dodo Customer Portal Session
        const session = await dodo.customers.customerPortal.create(project.dodoCustomerId, {
            send_email: false,
        });

        return NextResponse.json({ url: session.link });
    } catch (error: any) {
        console.error("Dodo Portal Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
