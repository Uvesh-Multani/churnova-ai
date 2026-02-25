import { NextResponse } from "next/server";
import { churnova } from "@/lib/churnova-sdk";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get("secret");

        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Starting Health Decay Cron Job...");
        const result = await churnova.applyHealthDecay();
        console.log(`Health Decay Completed: ${result.processed} customers updated.`);

        return NextResponse.json({
            success: true,
            message: "Health decay applied successfully",
            ...result
        });
    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
