import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Simple in-memory schedule store (in production, persist to DB)
let scheduleStore: {
  email: string;
  frequency: string;
  enabled: boolean;
  lastSent: string | null;
  createdAt: string;
} | null = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

// POST /api/email/schedule — save or update schedule
export async function POST(req: NextRequest) {
  try {
    const { email, frequency, action } = await req.json();

    if (action === "delete") {
      scheduleStore = null;
      return NextResponse.json({ success: true, message: "Schedule cancelled" });
    }

    if (!email || !frequency) {
      return NextResponse.json({ error: "email and frequency required" }, { status: 400 });
    }

    const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    scheduleStore = {
      email,
      frequency,
      enabled: true,
      lastSent: null,
      createdAt: new Date().toISOString(),
    };

    // Send a confirmation email immediately if SMTP is configured
    if (isConfigured) {
      const transporter = getTransporter();
      const smtpUser = process.env.SMTP_USER!;
      const fromAddress = process.env.SMTP_FROM || `Churnova AI <${smtpUser}>`;

      const confirmHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;margin:0;padding:32px 16px;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:28px 32px;">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">✅ Report Schedule Confirmed</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Churnova AI will deliver your reports automatically</p>
          </div>
          <div style="padding:28px 32px;">
            <p style="margin:0 0 16px;font-size:14px;color:#334155;">Hi there,</p>
            <p style="margin:0 0 20px;font-size:14px;color:#64748B;line-height:1.6;">
              Your <strong style="color:#0F172A;">${frequency}</strong> Churnova AI report digest has been scheduled. You'll receive your first full report at the next scheduled interval.
            </p>
            
            <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#4F46E5;text-transform:uppercase;letter-spacing:0.5px;">Schedule Details</p>
              <p style="margin:4px 0;font-size:13px;color:#0F172A;"><strong>Recipient:</strong> ${email}</p>
              <p style="margin:4px 0;font-size:13px;color:#0F172A;"><strong>Frequency:</strong> ${frequency}</p>
              <p style="margin:4px 0;font-size:13px;color:#0F172A;"><strong>Reports Included:</strong> Weekly Risk Summary, Revenue at Risk, Engagement Health</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/reports"
              style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:700;">
              Manage Reports →
            </a>
          </div>
          <div style="background:#F8FAFC;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94A3B8;">Churnova AI · Intelligent Churn Prevention · <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings" style="color:#6366F1;text-decoration:none;">Manage Preferences</a></p>
          </div>
        </div>
      </body>
      </html>`;

      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `✅ Churnova AI Reports Scheduled — ${frequency} digest confirmed`,
        html: confirmHtml,
        text: `Your ${frequency} Churnova AI report digest has been scheduled for ${email}.`,
      });
    }

    return NextResponse.json({
      success: true,
      schedule: scheduleStore,
      emailSent: isConfigured,
      configured: isConfigured,
    });
  } catch (error: any) {
    console.error("[SCHEDULE ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/email/schedule — get current schedule
export async function GET() {
  return NextResponse.json({
    schedule: scheduleStore,
    configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  });
}

// DELETE /api/email/schedule — cancel schedule
export async function DELETE() {
  scheduleStore = null;
  return NextResponse.json({ success: true, message: "Schedule cancelled" });
}
