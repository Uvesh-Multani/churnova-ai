import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 });
        }

        // Validate API Key and fetch Project using the new ApiKey relation model
        const apiKeyRecord = await prisma.apiKey.findFirst({
            where: { key: apiKey },
            include: { project: true }
        });

        if (!apiKeyRecord) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const project = apiKeyRecord.project;
        const body = await req.json();

        if (!body.events || !Array.isArray(body.events)) {
            return NextResponse.json({ error: "Invalid payload: 'events' array required" }, { status: 400 });
        }

        const customersCreated = [];

        // Batch processing 
        for (const event of body.events) {
            const externalId = event.userId;
            if (!externalId) continue;

            const props = event.properties || {};

            // Upsert Customer
            const customer = await prisma.customer.upsert({
                where: {
                    projectId_externalId: {
                        projectId: project.id,
                        externalId: externalId
                    }
                },
                update: {
                    lastSeen: new Date(),
                    loginFrequency: props.login_count ? Number(props.login_count) : undefined,
                    avgSessionDuration: props.avg_session_duration ? Number(props.avg_session_duration) : undefined,
                    featureUsageRate: props.feature_usage_count ? Number(props.feature_usage_count) : undefined,
                },
                create: {
                    externalId,
                    projectId: project.id,
                    name: `User ${externalId}`,
                    lastSeen: new Date(),
                    loginFrequency: props.login_count ? Number(props.login_count) : 0,
                    avgSessionDuration: props.avg_session_duration ? Number(props.avg_session_duration) : 0,
                    featureUsageRate: props.feature_usage_count ? Number(props.feature_usage_count) : 0,
                    healthScore: 100, // Newly tracking assumed fully healthy until ML runs
                    riskLevel: "Low",
                    anomalyScore: 0,
                    churnProbability: 0,
                    aiInsight: "New user integrated via Batch Upload API. Awaiting ML analysis."
                }
            });

            // Record a batch upload event
            await prisma.event.create({
                data: {
                    name: "batch_upload",
                    customerId: customer.id,
                    properties: JSON.stringify(props),
                }
            });

            customersCreated.push(customer.id);
        }

        return NextResponse.json({
            success: true,
            message: `Telemetry batch ingested safely. Processed ${customersCreated.length} records.`
        });

    } catch (error: any) {
        console.error("Tracking API Batch Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
