import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { projectId, events } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
        }

        if (!events || !Array.isArray(events)) {
            return NextResponse.json({ error: "Invalid payload: 'events' array required" }, { status: 400 });
        }

        // Verify the user owns the project
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.ownerId !== userId) {
            console.error(`[BATCH UPLOAD API] Auth Failure. Token User: ${userId} | Target Project: ${projectId} | DB Owner: ${project?.ownerId}`);
            return NextResponse.json({ 
                error: "Project not found or unauthorized",
                details: `Auth Debug -> Token: ${userId} | Target: ${projectId} | DB Owner: ${project?.ownerId}` 
            }, { status: 404 });
        }

        const customersCreated = [];
        const BATCH_SIZE = 100;

        for (let i = 0; i < events.length; i += BATCH_SIZE) {
            console.log(`[BATCH UPLOAD] Processing chunk ${i} to ${i + BATCH_SIZE}`);
            const batch = events.slice(i, i + BATCH_SIZE);
            const queryPipeline = [];

            for (const event of batch) {
                const externalId = event.userId;
                if (!externalId) continue;

                const props = event.properties || {};

                const upsertPromise = prisma.customer.upsert({
                    where: {
                        projectId_externalId: { projectId: project.id, externalId: externalId }
                    },
                    update: {
                        lastSeen: new Date(),
                        name: event.name || undefined,
                        email: event.email || undefined,
                        company: event.company || undefined,
                        loginFrequency: props.login_count ? Number(props.login_count) : undefined,
                        avgSessionDuration: props.avg_session_duration ? Number(props.avg_session_duration) : undefined,
                        featureUsageRate: props.feature_usage_count ? Number(props.feature_usage_count) : undefined,
                    },
                    create: {
                        externalId,
                        projectId: project.id,
                        name: event.name || `User ${externalId}`,
                        email: event.email || `${externalId}@example.com`,
                        company: event.company || "Unknown",
                        lastSeen: new Date(),
                        loginFrequency: props.login_count ? Number(props.login_count) : 0,
                        avgSessionDuration: props.avg_session_duration ? Number(props.avg_session_duration) : 0,
                        featureUsageRate: props.feature_usage_count ? Number(props.feature_usage_count) : 0,
                        healthScore: 100,
                        riskLevel: "Low",
                        anomalyScore: 0,
                        churnProbability: 0,
                        aiInsight: "New user integrated via Batch Upload API. Awaiting ML analysis."
                    }
                });

                queryPipeline.push(upsertPromise);
                
                // We cannot push the `event.create` containing `customer.id` synchronously if we don't have the `id` yet.
                // However, `customerId` is actually mapped to `externalId` in some places, or a uuid. 
                // Ah, wait. `prisma.event.create` strictly needs the database `customer.id`. We can't batch them if we need `customer.id` dynamically!
            }
            
            // Execute the Customer chunk
            const resolvedCustomers = await prisma.$transaction(queryPipeline);
            
            // Execute the Event chunk
            const eventPipeline = [];
            for (let j = 0; j < resolvedCustomers.length; j++) {
                 const customerId = resolvedCustomers[j].id;
                 const eventProps = batch[j].properties || {};
                 eventPipeline.push(
                     prisma.event.create({
                         data: {
                             name: "batch_upload",
                             customerId: customerId,
                             properties: JSON.stringify(eventProps)
                         }
                     })
                 );
                 customersCreated.push(customerId);
            }
            
            await prisma.$transaction(eventPipeline);
        }

        console.log(`[BATCH UPLOAD FINISHED] Successfully returning 200 OK.`);
        return NextResponse.json({
            success: true,
            message: `Telemetry batch ingested safely. Processed ${customersCreated.length} records.`
        });

    } catch (error: any) {
        console.error("Internal Tracking API Batch Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
