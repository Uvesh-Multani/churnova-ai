import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const data = await req.json();

        // Ensure user owns the project
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name: data.name,
                slackWebhookUrl: data.slackWebhookUrl,
                alertEmail: data.alertEmail,
                alertsEnabled: data.alertsEnabled,
                stripeKey: data.stripeKey,
                dodoWebhookUrl: data.dodoWebhookUrl,
                paddleKey: data.paddleKey,
                razorpayKey: data.razorpayKey,
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error: any) {
        console.error("Project Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error: any) {
        console.error("Project Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized to delete" }, { status: 404 });
        }

        const customers = await prisma.customer.findMany({
            where: { projectId: id },
            select: { id: true },
        });

        const customerIds = customers.map(c => c.id);

        if (customerIds.length > 0) {
            await prisma.event.deleteMany({
                where: { customerId: { in: customerIds } },
            });

            await prisma.healthScore.deleteMany({
                where: { customerId: { in: customerIds } },
            });

            await prisma.customer.deleteMany({
                where: { projectId: id },
            });
        }

        await prisma.apiKey.deleteMany({
            where: { projectId: id },
        });

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "Project deleted successfully" });
    } catch (error: any) {
        console.error("Project Deletion Error:", error);
        return NextResponse.json({ error: "Failed to delete project", details: error.message }, { status: 500 });
    }
}
