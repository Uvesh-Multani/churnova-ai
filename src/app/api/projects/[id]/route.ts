import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
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
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error: any) {
        console.error("Project Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
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
