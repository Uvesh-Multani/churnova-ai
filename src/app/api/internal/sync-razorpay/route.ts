import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

// Helper: fetch all pages from a Razorpay list endpoint
async function fetchAllRazorpay(url: string, authHeader: string, maxItems = 200) {
    const allItems: any[] = [];
    let skip = 0;
    const count = 100; // Razorpay max per page

    while (allItems.length < maxItems) {
        const res = await fetch(`${url}?count=${count}&skip=${skip}`, {
            headers: { "Authorization": authHeader },
        });
        if (!res.ok) break;
        const data = await res.json();
        const items = data.items || [];
        if (items.length === 0) break;
        allItems.push(...items);
        skip += count;
        if (items.length < count) break; // last page
    }

    return allItems;
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await req.json();

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const razorpayRawKey = project.razorpayKey;
        if (!razorpayRawKey || !razorpayRawKey.includes(":")) {
            return NextResponse.json({ error: "Invalid Razorpay credentials stored" }, { status: 400 });
        }

        const [keyId, keySecret] = razorpayRawKey.split(":");
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

        try {
            // ── Step 1: Fetch Customers ──
            const customersRes = await fetch("https://api.razorpay.com/v1/customers?count=100", {
                headers: { "Authorization": authHeader },
            });
            const customersData = await customersRes.json();

            if (!customersRes.ok) {
                console.error("Razorpay Customers API Error:", customersData);
                return NextResponse.json({ error: "Failed to authenticate with Razorpay. Check your keys." }, { status: 400 });
            }

            // ── Step 2: Fetch Payments (real transaction data) ──
            let payments: any[] = [];
            try {
                payments = await fetchAllRazorpay("https://api.razorpay.com/v1/payments", authHeader, 200);
            } catch (e) {
                console.warn("Could not fetch payments, continuing with customers only:", e);
            }

            // ── Step 3: Build a map of email → payment stats ──
            const paymentMap: Record<string, { totalAmount: number; count: number; lastPayment: Date; methods: Set<string> }> = {};
            for (const p of payments) {
                if (p.status !== "captured") continue; // Only count successful payments
                const email = p.email || p.customer?.email || "unknown";
                if (!paymentMap[email]) {
                    paymentMap[email] = { totalAmount: 0, count: 0, lastPayment: new Date(0), methods: new Set() };
                }
                paymentMap[email].totalAmount += (p.amount || 0) / 100; // Razorpay amounts are in paise
                paymentMap[email].count += 1;
                const payDate = new Date((p.created_at || 0) * 1000);
                if (payDate > paymentMap[email].lastPayment) {
                    paymentMap[email].lastPayment = payDate;
                }
                if (p.method) paymentMap[email].methods.add(p.method);
            }

            // ── Step 4: Merge Customers + Payment-only users ──
            const customerList = customersData.items || [];

            // Also create customer entries for emails found in payments but not in customers list
            const customerEmails = new Set(customerList.map((c: any) => c.email));
            const paymentOnlyEmails = Object.keys(paymentMap).filter(
                email => email !== "unknown" && !customerEmails.has(email)
            );

            // Build unified records to upsert
            interface CustomerRecord {
                externalId: string;
                name: string;
                email: string;
                createdAt: number;
                paymentStats?: { totalAmount: number; count: number; lastPayment: Date; methods: Set<string> };
            }

            const allRecords: CustomerRecord[] = [];

            // From Razorpay customers endpoint
            for (const c of customerList) {
                allRecords.push({
                    externalId: c.id,
                    name: c.name || "Unknown",
                    email: c.email || "no-email@example.com",
                    createdAt: c.created_at || Math.floor(Date.now() / 1000),
                    paymentStats: paymentMap[c.email] || undefined,
                });
            }

            // From payments-only (users who paid but aren't in customers list)
            for (const email of paymentOnlyEmails) {
                const stats = paymentMap[email];
                allRecords.push({
                    externalId: `rzp_payment_${crypto.createHash('md5').update(email).digest('hex').substring(0, 12)}`,
                    name: email.split("@")[0],
                    email: email,
                    createdAt: Math.floor(stats.lastPayment.getTime() / 1000),
                    paymentStats: stats,
                });
            }

            if (allRecords.length === 0) {
                return NextResponse.json({ message: "Connected successfully, but no customers or payments found in your Razorpay account." });
            }

            // ── Step 5: Upsert into DB with real payment metrics ──
            const queryPipeline = [];

            for (const record of allRecords) {
                const hashDigest = crypto.createHash('md5').update(record.externalId).digest('hex');
                const pRandomInt = parseInt(hashDigest.substring(0, 8), 16);

                const stats = record.paymentStats;
                const realMrr = stats ? stats.totalAmount / Math.max(stats.count, 1) : 0;
                const daysSinceLastPayment = stats 
                    ? Math.floor((Date.now() - stats.lastPayment.getTime()) / (1000 * 60 * 60 * 24)) 
                    : 999;

                // Compute health score from real data when available
                let healthScore = 50;
                if (stats) {
                    healthScore = Math.min(100, Math.max(10,
                        Math.round(
                            (stats.count >= 3 ? 30 : stats.count * 10) +     // Payment frequency
                            (daysSinceLastPayment < 30 ? 40 : daysSinceLastPayment < 90 ? 20 : 5) + // Recency
                            (stats.totalAmount > 5000 ? 30 : stats.totalAmount > 1000 ? 20 : 10)     // Value
                        )
                    ));
                } else {
                    healthScore = 60 + (pRandomInt % 40);
                }

                const riskLevel = healthScore >= 70 ? "Low" : healthScore >= 40 ? "Medium" : "High";

                const query = prisma.customer.upsert({
                    where: {
                        projectId_externalId: {
                            projectId: project.id,
                            externalId: record.externalId
                        }
                    },
                    update: {
                        name: record.name,
                        email: record.email,
                        lastSeen: stats?.lastPayment || new Date(record.createdAt * 1000),
                        mrr: realMrr,
                        healthScore: healthScore,
                        riskLevel: riskLevel,
                    },
                    create: {
                        projectId: project.id,
                        externalId: record.externalId,
                        name: record.name,
                        email: record.email,
                        company: "Razorpay",
                        healthScore: healthScore,
                        riskLevel: riskLevel,
                        subscriptionStatus: stats ? "active" : "inactive",
                        plan: stats && stats.totalAmount > 5000 ? "Enterprise" : stats && stats.totalAmount > 1000 ? "Pro" : "Starter",
                        mrr: realMrr,
                        anomalyScore: daysSinceLastPayment > 90 ? 25 : 0,
                        loginFrequency: stats ? Math.min(stats.count, 10) : 0,
                        avgSessionDuration: stats ? 5 + (stats.count * 3) : 0,
                        featureUsageRate: stats ? Math.min(30 + stats.count * 10, 100) : 0,
                        churnProbability: healthScore < 40 ? 0.8 : healthScore < 70 ? 0.4 : 0.1,
                        lastSeen: stats?.lastPayment || new Date(record.createdAt * 1000),
                    }
                });

                queryPipeline.push(query);
            }

            const results = await prisma.$transaction(queryPipeline);

            return NextResponse.json({
                message: `Successfully synced ${results.length} records from Razorpay (${customerList.length} customers, ${payments.length} payments)`,
                stats: {
                    customers: customerList.length,
                    payments: payments.length,
                    totalSynced: results.length,
                }
            });

        } catch (fetchError: any) {
            console.error("Razorpay Sync Fetch Error:", fetchError);
            return NextResponse.json({ error: `Network error: ${fetchError.message || 'Unknown'}` }, { status: 502 });
        }

    } catch (error: any) {
        console.error("Razorpay Sync Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
