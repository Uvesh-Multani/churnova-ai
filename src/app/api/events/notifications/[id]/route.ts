import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { isRead, isDeleted } = body;

        // Check if it's a "virtual" alert (starts with alert-)
        // If it's virtual, we can't update it in the DB. 
        // The frontend will handle virtual alerts using localStorage.
        if (id.startsWith("alert-")) {
            return NextResponse.json({ success: true, virtual: true });
        }

        // Verify ownership through the customer and project
        const event = await prisma.event.findFirst({
            where: {
                id: id,
                customer: {
                    project: {
                        ownerId: userId
                    }
                }
            }
        });

        if (!event) {
            return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
        }

        const updatedEvent = await prisma.event.update({
            where: { id: id },
            data: {
                ...(isRead !== undefined && { isRead }),
                ...(isDeleted !== undefined && { isDeleted })
            }
        });

        return NextResponse.json(updatedEvent);
    } catch (error: any) {
        console.error("Update Notification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
