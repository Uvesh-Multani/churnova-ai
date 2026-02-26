import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dodo, PLANS } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json({ error: "session_id is required" }, { status: 400 });
        }

        // Retrieve checkout session from Dodo
        console.log(`Verifying Dodo Session: ${sessionId}`);
        const sessionStatus = await dodo.checkoutSessions.retrieve(sessionId);

        if (sessionStatus.payment_status === "succeeded") {
            if (sessionStatus.payment_id) {
                const payment = await dodo.payments.retrieve(sessionStatus.payment_id);

                let projectId = payment.metadata?.projectId;
                const subscriptionId = payment.subscription_id;

                if (!projectId && subscriptionId) {
                    const subscription = await dodo.subscriptions.retrieve(subscriptionId);
                    projectId = subscription.metadata?.projectId;
                }

                if (projectId) {
                    const project = await prisma.project.findUnique({
                        where: { id: projectId },
                    });

                    if (project && project.ownerId === userId) {
                        // Determine plan
                        const productId = subscriptionId ? (await dodo.subscriptions.retrieve(subscriptionId)).product_id : payment.product_cart?.[0]?.product_id;
                        let plan = "FREE";
                        if (productId === PLANS.BASIC.productId) plan = "BASIC";
                        else if (productId === PLANS.PRO.productId) plan = "PRO";

                        await prisma.project.update({
                            where: { id: projectId },
                            data: {
                                dodoCustomerId: payment.customer.customer_id,
                                dodoSubscriptionId: subscriptionId,
                                subscriptionStatus: "active",
                                plan: plan as any,
                            },
                        });
                        return NextResponse.json({ success: true, plan });
                    }
                }
            }
        }
        else {
            console.log(`Dodo payment status is ${sessionStatus.payment_status}, not succeeded.`);
        }

        return NextResponse.json({
            success: sessionStatus.payment_status === "succeeded",
            status: sessionStatus.payment_status || "collecting_details",
            plan: "FREE"
        });
    } catch (error: any) {
        console.error("Dodo Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
