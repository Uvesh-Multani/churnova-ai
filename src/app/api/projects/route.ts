import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const apiKey = `chr_${uuidv4().replace(/-/g, "")}`;

        const project = await prisma.project.create({
            data: {
                name,
                ownerId: userId,
                apiKeys: {
                    create: {
                        name: "Default API Key",
                        key: apiKey
                    }
                }
            },
        });

        return NextResponse.json(project);
    } catch (error: any) {
        console.error("Project Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const projects = await prisma.project.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("Project List Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
