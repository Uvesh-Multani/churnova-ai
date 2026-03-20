import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dodo, PLANS } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";

const SESSION_ID_PLACEHOLDER = "{checkout_id}";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get("session_id");
        const subscriptionIdParam = searchParams.get("subscription_id");

        // Dodo often redirects with literal {checkout_id} and does NOT replace it; they do pass the real subscription_id in the URL.
        // Prefer verifying by subscription_id when present (e.g. sub_xxx).
        const hasRealSubscriptionId = subscriptionIdParam && subscriptionIdParam.startsWith("sub_") && subscriptionIdParam.length > 10;
        const hasRealSessionId = sessionId && sessionId !== SESSION_ID_PLACEHOLDER && !sessionId.startsWith("%7B");

        if (hasRealSubscriptionId) {
            // Verify using subscription ID from Dodo redirect (works when return_url had literal {checkout_id})
            console.log(`Verifying Dodo Subscription: ${subscriptionIdParam}`);
            const subscription = await dodo.subscriptions.retrieve(subscriptionIdParam);
            const projectId = (subscription.metadata as any)?.projectId;
            const customerId = subscription.customer?.customer_id;
            const productId = subscription.product_id;
            const status = (subscription as any).status;

            if (projectId && (status === "active" || status === "trialing")) {
                const project = await prisma.project.findUnique({
                    where: { id: projectId },
                });
                if (project && project.ownerId === userId) {
                    let plan: "FREE" | "BASIC" | "PRO" = "FREE";
                    if (productId === PLANS.BASIC.productId) plan = "BASIC";
                    else if (productId === PLANS.PRO.productId) plan = "PRO";

                    await prisma.project.update({
                        where: { id: projectId },
                        data: {
                            ...(customerId && { dodoCustomerId: customerId }),
                            dodoSubscriptionId: subscriptionIdParam,
                            subscriptionStatus: status || "active",
                            plan,
                        },
                    });
                    return NextResponse.json({ success: true, plan });
                }
            }
            return NextResponse.json({
                success: false,
                status: status || "pending",
                plan: "FREE",
            });
        }

        if (!hasRealSessionId) {
            return NextResponse.json({
                error: "session_id or subscription_id required",
                success: false,
                status: "pending",
                plan: "FREE",
            }, { status: 400 });
        }

        // Fallback: verify using checkout session ID (when Dodo replaces {checkout_id} with a real ID)
        console.log(`Verifying Dodo Session: ${sessionId}`);
        const sessionStatus = await dodo.checkoutSessions.retrieve(sessionId);
        const sessionMetadata = (sessionStatus as any).metadata || {};
        const sessionSubscriptionId = (sessionStatus as any).subscription_id;

        if (sessionStatus.payment_status === "succeeded") {
            let projectId: string | undefined;
            let subscriptionId: string | undefined;
            let customerId: string | undefined;
            let productId: string | undefined;

            if (sessionStatus.payment_id) {
                const payment = await dodo.payments.retrieve(sessionStatus.payment_id);
                projectId = payment.metadata?.projectId;
                subscriptionId = payment.subscription_id ?? undefined;
                customerId = payment.customer?.customer_id;
                productId = payment.product_cart?.[0]?.product_id;
            }
            if (!projectId && sessionSubscriptionId) {
                const subscription = await dodo.subscriptions.retrieve(sessionSubscriptionId);
                projectId = subscription.metadata?.projectId ?? sessionMetadata.projectId;
                subscriptionId = sessionSubscriptionId;
                customerId = subscription.customer?.customer_id;
                productId = subscription.product_id;
            }
            if (!projectId) projectId = sessionMetadata.projectId;

            if (projectId) {
                const project = await prisma.project.findUnique({
                    where: { id: projectId },
                });

                if (project && project.ownerId === userId) {
                    if (!productId && subscriptionId) {
                        const sub = await dodo.subscriptions.retrieve(subscriptionId);
                        productId = sub.product_id;
                    }
                    let plan: "FREE" | "BASIC" | "PRO" = "FREE";
                    if (productId === PLANS.BASIC.productId) plan = "BASIC";
                    else if (productId === PLANS.PRO.productId) plan = "PRO";

                    await prisma.project.update({
                        where: { id: projectId },
                        data: {
                            ...(customerId && { dodoCustomerId: customerId }),
                            ...(subscriptionId && { dodoSubscriptionId: subscriptionId }),
                            subscriptionStatus: "active",
                            plan,
                        },
                    });
                    return NextResponse.json({ success: true, plan });
                }
            }
        } else {
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
