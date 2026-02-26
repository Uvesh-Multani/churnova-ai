import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dodo } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId, productId } = await req.json();

        if (!projectId || !productId) {
            return NextResponse.json({ error: "Project ID and Product ID are required" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        // Create Dodo Checkout Session
        const session = await dodo.checkoutSessions.create({
            product_cart: [{
                product_id: productId,
                quantity: 1,
            }],
            return_url: `${(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")}/dashboard?session_id={checkout_id}`,
            metadata: {
                projectId,
                userId,
            },
            subscription_data: {
                metadata: {
                    projectId,
                    userId,
                }
            } as any
        });

        return NextResponse.json({ url: session.checkout_url });
    } catch (error: any) {
        console.error("Dodo Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
