import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = authHeader.split(" ")[1];

        const apiKeyRecord = await prisma.apiKey.findFirst({
            where: { key: apiKey },
            include: { project: true }
        });

        if (!apiKeyRecord) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const project = apiKeyRecord.project;

        const body = await req.json();

        // Required fields
        const { externalId, email, name, company } = body;

        if (!externalId) {
            return NextResponse.json({ error: "Missing externalId" }, { status: 400 });
        }

        // Optional numeric telemetry (will be processed by ML models later)
        const loginFrequency = body.loginFrequency !== undefined ? Number(body.loginFrequency) : undefined;
        const avgSessionDuration = body.avgSessionDuration !== undefined ? Number(body.avgSessionDuration) : undefined;
        const featureUsageRate = body.featureUsageRate !== undefined ? Number(body.featureUsageRate) : undefined;

        // Upsert Customer by unique externalId per project
        const customer = await prisma.customer.upsert({
            where: {
                projectId_externalId: {
                    projectId: project.id,
                    externalId: externalId
                }
            },
            update: {
                name: name !== undefined ? name : undefined,
                email: email !== undefined ? email : undefined,
                company: company !== undefined ? company : undefined,
                lastSeen: new Date(),
                loginFrequency: loginFrequency,
                avgSessionDuration: avgSessionDuration,
                featureUsageRate: featureUsageRate,
            },
            create: {
                externalId,
                projectId: project.id,
                name: name || "Unknown User",
                email: email,
                company: company,
                lastSeen: new Date(),
                loginFrequency: loginFrequency || 0,
                avgSessionDuration: avgSessionDuration || 0,
                featureUsageRate: featureUsageRate || 0,
                healthScore: 100, // Newly tracking assumed fully healthy until ML runs
                riskLevel: "Low",
                anomalyScore: 0,
                churnProbability: 0,
                aiInsight: "New user integrated via Tracking API. Awaiting ML analysis."
            }
        });

        // Record a generic "api_ping" event
        await prisma.event.create({
            data: {
                name: "api_ping",
                customerId: customer.id,
                properties: JSON.stringify(body),
            }
        });

        return NextResponse.json({
            success: true,
            message: "Telemetry ingested successfully.",
            customer: customer.id
        });

    } catch (error: any) {
        console.error("Tracking API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
