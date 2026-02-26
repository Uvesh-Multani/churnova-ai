import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { dodo, PLANS } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

        // Retrieve all projects for this user
        const projects = await prisma.project.findMany({
            where: { ownerId: userId },
        });

        console.log(`Syncing subscriptions for user ${userId} (${userEmail}), found ${projects.length} projects`);

        for (const project of projects) {
            // Option 1: Find payments for this project
            const payments = await dodo.payments.list({ status: "succeeded" });
            const projectPayments = (payments.items || []).filter((p: any) =>
                p.metadata?.projectId === project.id || (userEmail && p.customer?.email?.toLowerCase() === userEmail)
            );

            // Option 2: Find subscriptions for this project
            const subscriptions = await dodo.subscriptions.list({ status: "active" });
            const projectSubscriptions = (subscriptions.items || []).filter((s: any) =>
                s.metadata?.projectId === project.id || (userEmail && s.customer?.email?.toLowerCase() === userEmail)
            );

            if (projectPayments.length > 0 || projectSubscriptions.length > 0) {
                const latestPayment = projectPayments[0];
                const latestSub = projectSubscriptions[0];

                // Determine plan based on product ID
                let productId = "";
                if (latestSub) {
                    const sub = await dodo.subscriptions.retrieve(latestSub.subscription_id);
                    productId = sub.product_id;
                } else if (latestPayment) {
                    const pay = await dodo.payments.retrieve(latestPayment.payment_id);
                    productId = pay.product_cart?.[0]?.product_id || "";
                }

                let plan = "FREE";
                if (productId === PLANS.BASIC.productId) plan = "BASIC";
                else if (productId === PLANS.PRO.productId) plan = "PRO";

                console.log(`Found ${plan} status for project ${project.id}`);

                await prisma.project.update({
                    where: { id: project.id },
                    data: {
                        dodoCustomerId: latestSub?.customer.customer_id || latestPayment?.customer.customer_id,
                        dodoSubscriptionId: latestSub?.subscription_id || latestPayment?.subscription_id,
                        subscriptionStatus: "active",
                        plan: plan as any,
                    },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Dodo Sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
