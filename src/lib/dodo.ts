import { DodoPayments } from "dodopayments";

// Dodo Payments client initialization
export const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || null,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || "test_mode",
});

export const PLANS = {
    FREE: {
        name: "Free",
        productId: "", // No product ID for free plan
        customersLimit: 10,
        price: "$0",
    },
    BASIC: {
        name: "Basic",
        productId: "pdt_0NZH9ryuJlwEfmVY31LtD", // Use current Pro ID for Basic
        customersLimit: 100,
        price: "$4.99",
        originalPrice: "$10",
    },
    PRO: {
        name: "Pro",
        productId: "pdt_0NZHABQxIs1EUYm0ju3nW", // Use current Enterprise ID for Pro
        customersLimit: 1000,
        price: "$12.99",
        originalPrice: "$30",
    },
};
