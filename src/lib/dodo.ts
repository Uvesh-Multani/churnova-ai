import { DodoPayments } from "dodopayments";

if (!process.env.DODO_PAYMENTS_API_KEY) {
    throw new Error("DODO_PAYMENTS_API_KEY is missing from environment variables");
}

export const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
});

export const PLANS = {
    FREE: {
        name: "Free",
        productId: "", // No product ID for free plan
        customersLimit: 10,
    },
    PRO: {
        name: "Pro",
        productId: "pdt_0NZH9ryuJlwEfmVY31LtD", // Replace with your Dodo Product ID
        customersLimit: 1000,
    },
    ENTERPRISE: {
        name: "Enterprise",
        productId: "pdt_0NZHABQxIs1EUYm0ju3nW", // Replace with your Dodo Product ID
        customersLimit: Infinity,
    },
};
