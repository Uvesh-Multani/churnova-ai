import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        let apiKeys = await prisma.apiKey.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' }
        });

        // Auto-generate a fallback key if this is an older project without one
        if (apiKeys.length === 0) {
            const rawKey = crypto.randomBytes(32).toString("hex");
            const newKey = await prisma.apiKey.create({
                data: {
                    name: "Default API Key",
                    key: `chr_${rawKey}`,
                    projectId: id,
                }
            });
            apiKeys = [newKey];
        }

        return NextResponse.json({ apiKeys });
    } catch (error: any) {
        console.error("API Key Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        // Generate a secure random key
        const rawKey = crypto.randomBytes(32).toString("hex");
        const apiKeyString = `chr_${rawKey}`;

        const newKey = await prisma.apiKey.create({
            data: {
                name,
                key: apiKeyString,
                projectId: id,
            }
        });

        return NextResponse.json(newKey);
    } catch (error: any) {
        console.error("API Key Creation Error:", error);
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
        const { keyId } = await req.json();

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        await prisma.apiKey.delete({
            where: { id: keyId, projectId: id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Key Deletion Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
