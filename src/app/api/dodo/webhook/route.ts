import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { dodo } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();

    try {
        // Dodo Payments Webhook Verification using the SDK
        // unwrap handles signature verification internally using the webhookKey passed during client initialization
        const event = dodo.webhooks.unwrap(body, {
            headers: {
                "webhook-id": headersList.get("webhook-id") || "",
                "webhook-signature": headersList.get("webhook-signature") || "",
                "webhook-timestamp": headersList.get("webhook-timestamp") || "",
            }
        }) as any;

        const eventType = event.type;
        const data = event.data;

        console.log(`Dodo Webhook verified: ${eventType}`, data);

        // Map Dodo status to internal status
        const statusMap: Record<string, string> = {
            'active': 'active',
            'pending': 'pending',
            'cancelled': 'cancelled',
            'failed': 'failed',
            'expired': 'expired',
            'on_hold': 'on_hold'
        };

        const subscriptionId = data.subscription_id;
        const internalStatus = statusMap[data.status] || data.status;

        switch (eventType) {
            case "subscription.active":
            case "subscription.renewed":
            case "subscription.updated":
                if (data.metadata?.projectId) {
                    await (prisma.project as any).update({
                        where: { id: data.metadata.projectId },
                        data: {
                            dodoCustomerId: data.customer?.customer_id || data.customer_id,
                            dodoSubscriptionId: subscriptionId,
                            subscriptionStatus: internalStatus,
                            plan: internalStatus === "active" ? "PRO" : "FREE",
                        },
                    });
                }
                break;

            case "subscription.cancelled":
            case "subscription.expired":
            case "subscription.failed":
                if (subscriptionId) {
                    await (prisma.project as any).updateMany({
                        where: { dodoSubscriptionId: subscriptionId },
                        data: {
                            subscriptionStatus: internalStatus,
                            plan: "FREE",
                        },
                    });
                }
                break;

            default:
                console.log(`Unhandled Dodo event type ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Dodo Webhook Error:", error);
        // Dodo expects a 4xx for invalid signatures or payload errors to stop retrying immediately
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 400 });
    }
}
