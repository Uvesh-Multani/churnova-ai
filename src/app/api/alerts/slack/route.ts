import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, message } = body;

        if (!projectId || !message) {
            return NextResponse.json({ error: "Missing projectId or message" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || !project.slackWebhookUrl) {
            return NextResponse.json({ error: "Slack webhook URL not configured for project" }, { status: 400 });
        }

        const slackResponse = await fetch(project.slackWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: message,
            }),
        });

        if (!slackResponse.ok) {
            console.error("Slack API error:", await slackResponse.text());
            return NextResponse.json({ error: "Failed to send to Slack" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Slack alert sent" });
    } catch (error: any) {
        console.error("Slack Alert Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
