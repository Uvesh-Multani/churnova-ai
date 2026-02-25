import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const alerts = {
    async sendSlackAlert(webhookUrl: string, payload: any) {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`Slack error: ${response.statusText}`);
            return true;
        } catch (err) {
            console.error('Slack Alert Failed:', err);
            return false;
        }
    },

    async sendEmailAlert(to: string, subject: string, html: string) {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('RESEND_API_KEY missing, skipping email alert.');
                return false;
            }
            await resend.emails.send({
                from: 'Churnova AI <alerts@churnova.ai>', // Replace with verified domain in production
                to,
                subject,
                html,
            });
            return true;
        } catch (err) {
            console.error('Email Alert Failed:', err);
            return false;
        }
    },

    async notifyRiskChange(projectId: string, customerId: string, oldScore: number, newScore: number) {
        // Only notify if risk increased or crossed the High Risk threshold (30)
        const crossedThreshold = oldScore >= 30 && newScore < 30;
        const significantDrop = (oldScore - newScore) >= 20;

        if (!crossedThreshold && !significantDrop) return;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || !project.alertsEnabled) return;

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) return;

        const alertMessage = {
            text: `🚨 *Churn Risk Alert: ${customer.name || customer.externalId}*`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `🚨 *Churn Risk Alert* for customer *${customer.name || customer.externalId}*`
                    }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Previous Score:* ${Math.round(oldScore)}` },
                        { type: "mrkdwn", text: `*New Score:* *${Math.round(newScore)}*` },
                        { type: "mrkdwn", text: `*Risk Level:* ${newScore < 30 ? "🔴 High" : "🟡 Medium"}` },
                        { type: "mrkdwn", text: `*Last Seen:* ${customer.lastSeen?.toLocaleString() || 'Never'}` }
                    ]
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: { type: "plain_text", text: "View in Dashboard" },
                            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/users?search=${customer.externalId}`
                        }
                    ]
                }
            ]
        };

        // Send Slack Alert
        if (project.slackWebhookUrl) {
            await this.sendSlackAlert(project.slackWebhookUrl, alertMessage);
        }

        // Send Email Alert
        if (project.alertEmail) {
            const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
          <h2 style="color: #f43f5e;">🚨 Churn Risk Alert</h2>
          <p>Customer <strong>${customer.name || customer.externalId}</strong> has reached a critical risk level.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Previous Health Score:</strong> ${Math.round(oldScore)}</p>
            <p><strong>New Health Score:</strong> <span style="color: #f43f5e;">${Math.round(newScore)}</span></p>
            <p><strong>Status:</strong> ${newScore < 30 ? "High Risk" : "Elevated Risk"}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/users?search=${customer.externalId}" 
             style="display: inline-block; padding: 12px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Customer Details
          </a>
          <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
            You are receiving this because alerts are enabled for your project "${project.name}" in Churnova AI.
          </p>
        </div>
      `;
            await this.sendEmailAlert(project.alertEmail, `🚨 Churnova Alert: Risk change for ${customer.externalId}`, emailHtml);
        }
    }
};
