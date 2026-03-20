import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

// ─── HTML Email Template ──────────────────────────────────────────────────────

function buildEmailHtml(data: {
  recipientEmail: string;
  reportType: string;
  totalUsers: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
  revenueAtRisk: number;
  totalMrr: number;
  healthScore: number;
  topHighRiskUsers: { name: string; company: string; riskScore: number; mrr: number; aiInsight: string }[];
  generatedAt: string;
}) {
  const {
    reportType, totalUsers, highRiskUsers, mediumRiskUsers, lowRiskUsers,
    revenueAtRisk, totalMrr, healthScore, topHighRiskUsers, generatedAt
  } = data;

  const riskPercent = totalUsers > 0 ? Math.round((highRiskUsers / totalUsers) * 100) : 0;

  const userRows = topHighRiskUsers.slice(0, 8).map(u => `
    <tr style="border-bottom: 1px solid #F1F5F9;">
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #0F172A;">${u.name}</td>
      <td style="padding: 10px 12px; font-size: 12px; color: #64748B;">${u.company}</td>
      <td style="padding: 10px 12px; text-align: center;">
        <span style="display:inline-block; background:#FEF2F2; color:#DC2626; border-radius:6px; padding:2px 8px; font-size:12px; font-weight:700;">${u.riskScore}</span>
      </td>
      <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #0F172A; text-align: center;">$${u.mrr}/mo</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Churnova AI — ${reportType}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#A855F7 100%);border-radius:16px 16px 0 0;padding:32px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 12px;margin-right:12px;">
                          <span style="color:#fff;font-weight:800;font-size:16px;letter-spacing:-0.5px;">C</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.5px;">Churnova AI</p>
                          <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;">Intelligent Churn Prevention</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;">${generatedAt}</p>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:10px;">Automated Report</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 4px;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${reportType}</p>
              <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">Platform health snapshot for your team's retention workflow</p>
            </td>
          </tr>

          <!-- KPI Cards -->
          <tr>
            <td style="background:#fff;padding:24px 36px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="25%" style="padding:0 6px 0 0;">
                    <div style="background:#FEF2F2;border-radius:12px;padding:16px;text-align:center;border:1px solid #FECACA;">
                      <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:#DC2626;">${highRiskUsers}</p>
                      <p style="margin:0;font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">High Risk</p>
                    </div>
                  </td>
                  <td width="25%" style="padding:0 6px;">
                    <div style="background:#FFFBEB;border-radius:12px;padding:16px;text-align:center;border:1px solid #FDE68A;">
                      <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:#D97706;">${mediumRiskUsers}</p>
                      <p style="margin:0;font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Medium Risk</p>
                    </div>
                  </td>
                  <td width="25%" style="padding:0 6px;">
                    <div style="background:#F0FDF4;border-radius:12px;padding:16px;text-align:center;border:1px solid #BBF7D0;">
                      <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:#16A34A;">${lowRiskUsers}</p>
                      <p style="margin:0;font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Low Risk</p>
                    </div>
                  </td>
                  <td width="25%" style="padding:0 0 0 6px;">
                    <div style="background:#EEF2FF;border-radius:12px;padding:16px;text-align:center;border:1px solid #C7D2FE;">
                      <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:#4F46E5;">${healthScore}%</p>
                      <p style="margin:0;font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Health Score</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Revenue At Risk Banner -->
          <tr>
            <td style="background:#fff;padding:0 36px 24px;">
              <div style="background:linear-gradient(135deg,#FEF2F2 0%,#FFF7ED 100%);border:1px solid #FECACA;border-radius:12px;padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0 0 2px;font-size:12px;color:#DC2626;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">⚠ Revenue at Risk</p>
                      <p style="margin:0;font-size:28px;font-weight:800;color:#DC2626;">$${revenueAtRisk.toFixed(2)}</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#92400E;">MRR exposure from ${highRiskUsers} high-risk accounts (${riskPercent}% of ${totalUsers} total users)</p>
                    </td>
                    <td align="right" style="padding-left:16px;">
                      <p style="margin:0 0 2px;font-size:12px;color:#64748B;font-weight:500;">Total MRR</p>
                      <p style="margin:0;font-size:20px;font-weight:700;color:#0F172A;">$${totalMrr.toFixed(2)}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background:#fff;padding:0 36px 16px;">
              <hr style="border:none;border-top:1px solid #E2E8F0;margin:0;" />
            </td>
          </tr>

          <!-- Top At-Risk Users Table -->
          ${topHighRiskUsers.length > 0 ? `
          <tr>
            <td style="background:#fff;padding:0 36px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0F172A;">🚨 Top High-Risk Accounts</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
                <thead>
                  <tr style="background:#F8FAFC;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">User</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Company</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Risk Score</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  ${userRows}
                </tbody>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- AI Insight Sample -->
          ${topHighRiskUsers[0] ? `
          <tr>
            <td style="background:#fff;padding:0 36px 24px;">
              <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:0.5px;">🤖 AI Insight — ${topHighRiskUsers[0].name}</p>
                <p style="margin:0;font-size:13px;color:#4C1D95;line-height:1.6;">${topHighRiskUsers[0].aiInsight || "No insight generated for this user."}</p>
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- CTA -->
          <tr>
            <td style="background:#fff;padding:0 36px 32px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/risk"
                style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:-0.2px;">
                View Full Risk Dashboard →
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#94A3B8;">Or view the <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/users" style="color:#6366F1;">Users page</a> or <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/reports" style="color:#6366F1;">Reports page</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F1F5F9;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94A3B8;">Sent by <strong>Churnova AI</strong> · Automated churn intelligence platform</p>
              <p style="margin:6px 0 0;font-size:11px;color:#94A3B8;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings" style="color:#6366F1;text-decoration:none;">Manage email preferences</a>
                &nbsp;·&nbsp;
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/reports" style="color:#6366F1;text-decoration:none;">View all reports</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── API Handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to,
      reportType = "Weekly Risk Digest",
      analytics,
      topHighRiskUsers = [],
    } = body;

    if (!to) {
      return NextResponse.json({ error: "Recipient email (to) is required" }, { status: 400 });
    }

    // Check SMTP config
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      return NextResponse.json({
        error: "Email service not configured",
        message: "Please ensure the email system is properly set up in the backend.",
        configured: false,
      }, { status: 503 });
    }

    const transporter = getTransporter();

    const generatedAt = new Date().toLocaleString("en-US", {
      weekday: "short", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short"
    });

    const html = buildEmailHtml({
      recipientEmail: to,
      reportType,
      totalUsers: analytics?.totalUsers ?? 0,
      highRiskUsers: analytics?.highRiskUsers ?? 0,
      mediumRiskUsers: analytics?.mediumRiskUsers ?? 0,
      lowRiskUsers: analytics?.lowRiskUsers ?? 0,
      revenueAtRisk: analytics?.revenueAtRisk ?? 0,
      totalMrr: analytics?.totalMrr ?? 0,
      healthScore: analytics?.healthScore ?? 0,
      topHighRiskUsers,
      generatedAt,
    });

    const fromAddress = process.env.SMTP_FROM || `Churnova AI <${smtpUser}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Churnova AI — ${reportType} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      html,
      text: `Churnova AI ${reportType}\n\nHigh Risk: ${analytics?.highRiskUsers}\nMedium Risk: ${analytics?.mediumRiskUsers}\nRevenue at Risk: $${analytics?.revenueAtRisk?.toFixed(2)}\nHealth Score: ${analytics?.healthScore}%\n\nView at: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      recipient: to,
      configured: true,
    });

  } catch (error: any) {
    console.error("[EMAIL SEND ERROR]", error);
    return NextResponse.json({
      error: error.message || "Failed to send email",
      configured: !!process.env.SMTP_USER,
    }, { status: 500 });
  }
}

// Test config endpoint
export async function GET() {
  const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return NextResponse.json({
    configured: isConfigured,
    host: process.env.SMTP_HOST || null,
    user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***` : null,
  });
}
