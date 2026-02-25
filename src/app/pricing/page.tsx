"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingCard from "@/components/ui/PricingCard";
import Badge from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Minus, Check, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { PLANS } from "@/lib/dodo";

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[var(--border-subtle)]">
            <button
                className="w-full py-6 flex items-center justify-between text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-dm-sans font-medium text-[16px] text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {question}
                </span>
                {isOpen ? (
                    <Minus size={20} className="text-[var(--text-muted)]" />
                ) : (
                    <Plus size={20} className="text-[var(--text-muted)]" />
                )}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-6" : "max-h-0"
                    }`}
            >
                <p className="font-dm-sans text-[15px] text-[var(--text-secondary)] leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export default function PricingPage() {
    const { activeProjectId } = useAppStore();
    const [loading, setLoading] = useState<string | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

    const handleCheckout = async (productId: string) => {
        if (!activeProjectId) {
            toast.error("Please select or create a project first.");
            return;
        }

        setLoading(productId);
        try {
            const res = await fetch("/api/dodo/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: activeProjectId, productId }),
            });

            const { url, error } = await res.json();
            if (error) throw new Error(error);
            if (url) window.location.href = url;
        } catch (err: any) {
            toast.error(err.message || "Something went wrong with checkout.");
        } finally {
            setLoading(null);
        }
    };

    const pricingData = [
        {
            tier: "Starter",
            monthlyPrice: "$0",
            annualPrice: "$0",
            priceId: "free",
            description: "For small teams just getting started with retention.",
            features: [
                "Up to 1,000 monthly tracked users",
                "Basic behavioral signals",
                "Standard dashboards",
                "Email support",
                "Single team member"
            ],
            ctaText: "Get Started Free",
            ctaHref: "/dashboard"
        },
        {
            tier: "Pro",
            monthlyPrice: "$124",
            annualPrice: "$99",
            priceId: PLANS.PRO.productId,
            description: "Advanced tools for growing SaaS companies.",
            features: [
                "Up to 50,000 monthly tracked users",
                "Advanced retention AI",
                "Custom health scoring",
                "Priority 24/7 support",
                "CRM integrations",
                "Up to 10 team members"
            ],
            ctaText: "Try Pro Free",
            ctaHref: "#",
            isPopular: true
        },
        {
            tier: "Enterprise",
            monthlyPrice: "Custom",
            annualPrice: "Custom",
            priceId: PLANS.ENTERPRISE.productId,
            description: "Scale-ready solutions for large organizations.",
            features: [
                "Unlimited tracked users",
                "Dedicated account manager",
                "Custom ML model training",
                "SLA guarantees",
                "On-premise deployment",
                "Unlimited team members"
            ],
            ctaText: "Contact Sales",
            ctaHref: "#"
        }
    ];

    const faqs = [
        {
            question: "How does the 14-day free trial work?",
            answer: "You get full access to all Pro features for 14 days. No credit card is required to start. At the end of the trial, you can choose to upgrade to Pro or keep the Starter plan for free."
        },
        {
            question: "Can I change plans at any time?",
            answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. If you upgrade, the change will be immediate. If you downgrade, it will take effect at the end of your current billing cycle."
        },
        {
            question: "What counts as a 'monthly tracked user'?",
            answer: "A monthly tracked user (MTU) is a unique user ID that has performed at least one event in your application within the billing month."
        },
        {
            question: "Do you offer discounts for non-profits?",
            answer: "Yes, we offer a 50% discount for registered non-profit organizations. Please contact our support team with your documentation to apply."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow pt-[120px] pb-24">
                {/* Pricing Hero */}
                <section className="px-6 mb-24 text-center">
                    <Badge className="mb-4">Pricing</Badge>
                    <h1 className="text-[42px] md:text-[52px] font-syne font-extrabold text-[var(--text-primary)] mb-6">
                        Simple, transparent pricing.
                    </h1>
                    <p className="text-[var(--text-secondary)] text-[18px] max-w-[600px] mx-auto mb-10">
                        No hidden fees, no complex tiers. Choose the plan that scales with your growth.
                    </p>

                    {/* Billing Switcher */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-[14px] font-medium transition-colors ${billingPeriod === 'monthly' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Monthly</span>
                        <button
                            className="w-14 h-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-1 relative flex items-center transition-colors hover:border-[var(--border-default)]"
                            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
                        >
                            <div
                                className={`w-5 h-5 bg-[var(--accent-primary)] rounded-full transition-transform duration-300 ease-in-out ${billingPeriod === 'annually' ? 'translate-x-[28px]' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-[14px] font-medium transition-colors ${billingPeriod === 'annually' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Annually</span>
                            <span className="text-[11px] font-bold text-[var(--accent-primary)] uppercase bg-[var(--accent-glow)] px-2 py-0.5 rounded">Save 20%</span>
                        </div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="px-6 mb-32">
                    <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pricingData.map((tier, idx) => (
                            <PricingCard
                                key={idx}
                                tier={tier.tier}
                                price={billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                                period={billingPeriod === 'monthly' ? '/mo' : '/yr'}
                                description={tier.description}
                                features={tier.features}
                                ctaText={loading === tier.priceId ? "Redirecting..." : tier.ctaText}
                                ctaHref={tier.ctaHref}
                                isPopular={tier.isPopular}
                                onClick={() => tier.priceId !== "free" ? handleCheckout(tier.priceId) : undefined}
                            />
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-6">
                    <div className="max-w-[800px] mx-auto">
                        <h2 className="text-[32px] font-syne font-bold text-[var(--text-primary)] mb-12 text-center">
                            Frequently Asked Questions
                        </h2>
                        <div className="flex flex-col">
                            {faqs.map((faq, idx) => (
                                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
