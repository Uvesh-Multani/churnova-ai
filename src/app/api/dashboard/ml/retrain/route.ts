import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
    try {
        console.log("Triggering ML Pipeline Retraining...");

        // Find the absolute path to the project root
        const rootDir = path.join(process.cwd());

        // Use the venv python to execute the ml/train.py script
        const trainCmd = process.platform === 'win32'
            ? `.\\venv\\Scripts\\python.exe ml/train.py`
            : `source venv/bin/activate && python3 ml/train.py`;

        const predictCmd = process.platform === 'win32'
            ? `.\\venv\\Scripts\\python.exe ml/predict.py`
            : `source venv/bin/activate && python3 ml/predict.py`;

        console.log("Executing Train...");
        const { stdout: trainOut, stderr: trainErr } = await execAsync(trainCmd, { cwd: rootDir });

        console.log("Executing Predict...");
        const { stdout: predictOut, stderr: predictErr } = await execAsync(predictCmd, { cwd: rootDir });

        if (trainErr && trainErr.toLowerCase().includes("error")) {
            console.error("ML Retrain Stderr:", trainErr);
        }
        if (predictErr && predictErr.toLowerCase().includes("error")) {
            console.error("ML Predict Stderr:", predictErr);
        }

        console.log("ML Retrain Results:", trainOut);
        console.log("ML Predict Results:", predictOut);

        const fs = require('fs');
        const metricsPath = path.join(rootDir, 'models', 'metrics.json');
        let metrics = null;
        if (fs.existsSync(metricsPath)) {
            try {
                metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            } catch (err) {
                console.error("Failed to parse metrics.json:", err);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Models retrained successfully", 
            output: predictOut,
            metrics: metrics 
        });
    } catch (error: any) {
        console.error("ML Retrain Failed (RAW ERROR):", error, error.stderr, error.stdout);
        return NextResponse.json({
            error: "Failed to retrain ML models",
            details: error.message,
            stderr: error.stderr ? error.stderr.toString() : null,
            stdout: error.stdout ? error.stdout.toString() : null
        }, { status: 500 });
    }
}
