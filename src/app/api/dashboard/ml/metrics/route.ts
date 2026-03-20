import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
    const metricsPath = path.join(process.cwd(), "models", "metrics.json");

    if (!fs.existsSync(metricsPath)) {
        return NextResponse.json({ error: "Metrics not found. Run ml/train.py first." }, { status: 404 });
    }

    try {
        const content = fs.readFileSync(metricsPath, "utf8");
        const metrics = JSON.parse(content);
        return NextResponse.json(metrics);
    } catch (err) {
        console.error("Failed to read metrics.json:", err);
        return NextResponse.json({ error: "Failed to parse metrics file." }, { status: 500 });
    }
}
