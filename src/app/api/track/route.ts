import { NextResponse } from "next/server";
import { churnova } from "@/lib/churnova-sdk";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, customerId, event, properties } = body;

        if (!apiKey || !customerId || !event) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newEvent = await churnova.track(apiKey, customerId, event, properties);

        return NextResponse.json({ success: true, eventId: newEvent.id });
    } catch (error: any) {
        console.error("Tracking Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
