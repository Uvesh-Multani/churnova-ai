import { NextResponse } from "next/server";
import { churnova } from "@/lib/churnova-sdk";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, customerId, ...traits } = body;

        if (!apiKey || !customerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const customer = await churnova.identify(apiKey, customerId, traits);

        return NextResponse.json({ success: true, customerId: customer.id });
    } catch (error: any) {
        console.error("Identify Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
