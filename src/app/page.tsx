"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeatureCard from "@/components/ui/FeatureCard";
import PricingCard from "@/components/ui/PricingCard";
import Badge from "@/components/ui/badge";
import {
  Zap,
  Shield,
  BarChart3,
  Users,
  Code2,
  Cpu,
  ArrowRight
} from "lucide-react";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const animatedRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Real-time Detection",
      description: "Identify silent churn signals as they happen. No more waiting for monthly reports."
    },
    {
      icon: BarChart3,
      title: "Usage Health Scoring",
      description: "Proprietary algorithms quantify the value your customers are getting from your product."
    },
    {
      icon: Shield,
      title: "Revenue Protection",
      description: "Automatically trigger workflows to save at-risk accounts before it's too late."
    },
    {
      icon: Users,
      title: "Engagement Insights",
      description: "Deep dive into user behavior to understand what drives long-term retention."
    },
    {
      icon: Code2,
      title: "Developer First",
      description: "Integrate with just a few lines of code. Support for all major languages and frameworks."
    },
    {
      icon: Cpu,
      title: "AI-Powered Predictions",
      description: "Machine learning models that get smarter with every data point from your users."
    }
  ];

  const pricingTiers = [
    {
      tier: "Starter",
      price: "$0",
      description: "For small teams just getting started with retention.",
      features: [
        "Up to 1,000 monthly tracked users",
        "Basic behavioral signals",
        "Standard dashboards",
        "Email support"
      ],
      ctaText: "Get Started Free",
      ctaHref: "#"
    },
    {
      tier: "Pro",
      price: "$99",
      description: "Advanced tools for growing SaaS companies.",
      features: [
        "Up to 50,000 monthly tracked users",
        "Advanced retention AI",
        "Custom health scoring",
        "Priority 24/7 support",
        "CRM integrations"
      ],
      ctaText: "Try Pro Free",
      ctaHref: "#",
      isPopular: true
    },
    {
      tier: "Enterprise",
      price: "Custom",
      description: "Scale-ready solutions for large organizations.",
      features: [
        "Unlimited tracked users",
        "Dedicated account manager",
        "Custom ML model training",
        "SLA guarantees",
        "On-premise deployment"
      ],
      ctaText: "Contact Sales",
      ctaHref: "#"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-[80px]">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 z-0 bg-[var(--gradient-hero)] pointer-events-none" />

          <div className="max-w-[1200px] mx-auto text-center relative z-10">
            <div
              ref={(el) => { if (el) animatedRefs.current[0] = el; }}
              className="fade-up"
              style={{ transitionDelay: "0ms" }}
            >
              <Badge className="mb-8">Now in Public Beta</Badge>
            </div>

            <h1
              ref={(el) => { if (el) animatedRefs.current[1] = el; }}
              className="fade-up text-[48px] md:text-[68px] font-syne font-extrabold leading-[1.1] md:leading-[1.0] tracking-[-0.04em] text-[var(--text-primary)] mb-6"
              style={{ transitionDelay: "100ms" }}
            >
              Predict. Protect. <br />
              <span className="text-[var(--accent-primary)]">Prevent Churn.</span>
            </h1>

            <p
              ref={(el) => { if (el) animatedRefs.current[2] = el; }}
              className="fade-up text-[var(--text-secondary)] text-[18px] md:text-[20px] max-w-[640px] mx-auto mb-10 leading-relaxed"
              style={{ transitionDelay: "200ms" }}
            >
              Intelligent SaaS platform that identifies engagement decline and abnormal usage
              before your customers decide to leave.
            </p>

            <div
              ref={(el) => { if (el) animatedRefs.current[3] = el; }}
              className="fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              style={{ transitionDelay: "300ms" }}
            >
              <button className="btn-primary px-8 py-4 text-[16px]">Get Started Free</button>
              <button className="btn-secondary px-8 py-4 text-[16px] gap-2">
                View Documentation <ArrowRight size={18} />
              </button>
            </div>

            <div
              ref={(el) => { if (el) animatedRefs.current[4] = el; }}
              className="fade-up mt-12"
              style={{ transitionDelay: "450ms" }}
            >
              <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-semibold mb-8">
                Trusted by 500+ teams worldwide
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                {/* Logo Placeholders */}
                {["Acme", "Globex", "Initech", "Umbrella", "Cyberdyne", "Hooli"].map(logo => (
                  <span key={logo} className="text-[20px] font-syne font-bold font-mono tracking-tighter text-[var(--text-secondary)]">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-[var(--bg-base)] py-24 md:py-32 px-6 border-t border-[var(--border-subtle)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20">
              <Badge className="mb-4">Why teams choose us</Badge>
              <h2 className="text-[32px] md:text-[38px] font-syne font-bold text-[var(--text-primary)]">
                Everything you need to <br /> save your revenue.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  ref={(el) => { if (el) animatedRefs.current[5 + idx] = el; }}
                  className="fade-up"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-24 md:py-32 px-6 bg-[var(--bg-base)] overflow-hidden">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-32">
            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <span className="absolute -top-12 -left-8 text-[72px] md:text-[120px] font-syne font-extrabold text-[var(--bg-elevated)] select-none z-0">01</span>
                <div className="relative z-10">
                  <Badge className="mb-4">Integration</Badge>
                  <h3 className="text-[28px] md:text-[38px] font-syne font-bold text-[var(--text-primary)] mb-6">
                    Connect your data <br /> in minutes.
                  </h3>
                  <p className="text-[var(--text-secondary)] text-[16px] leading-relaxed mb-8 max-w-[480px]">
                    Single API integration that captures every meaningful user interaction.
                    Compatible with your existing tech stack out of the box.
                  </p>
                  <ul className="flex flex-col gap-4">
                    {["Next.js & React Native", "Python & Node.js", "Segment & PostHog"].map(item => (
                      <li key={item} className="flex items-center gap-3 text-[var(--text-primary)] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl aspect-video relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <pre className="p-6 font-mono text-[13px] text-[var(--text-secondary)] overflow-x-auto">
                  <code>{`// Initialize Churnova\nconst analytics = new Churnova('YOUR_API_KEY');\n\n// Identify user\nanalytics.identify('user_123', {\n  plan: 'Enterprise',\n  signup_date: '2023-01-01'\n});\n\n// Track event\nanalytics.track('api_call_success');`}</code>
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2 relative">
                <span className="absolute -top-12 -left-8 text-[72px] md:text-[120px] font-syne font-extrabold text-[var(--bg-elevated)] select-none z-0">02</span>
                <div className="relative z-10">
                  <Badge className="mb-4">Visualization</Badge>
                  <h3 className="text-[28px] md:text-[38px] font-syne font-bold text-[var(--text-primary)] mb-6">
                    See the health of <br /> your entire customer base.
                  </h3>
                  <p className="text-[var(--text-secondary)] text-[16px] leading-relaxed mb-10 max-w-[480px]">
                    Beautiful, data-dense dashboards that highlight abnormal trends and
                    behavioral anomalies across your entire user population.
                  </p>
                  <button className="btn-secondary">Explore Dashboard Features</button>
                </div>
              </div>
              <div className="lg:order-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl aspect-[4/3] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[60%] border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-base)] p-4 flex flex-col gap-4 translate-y-8">
                    <div className="flex justify-between">
                      <div className="w-24 h-4 bg-[var(--bg-elevated)] rounded" />
                      <div className="w-16 h-4 bg-[var(--accent-glow)] rounded" />
                    </div>
                    <div className="flex-grow flex items-end gap-2">
                      {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-grow bg-[var(--accent-primary)] opacity-20" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-24 md:py-32 px-6 bg-[var(--bg-base)] border-y border-[var(--border-subtle)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[32px] md:text-[38px] font-syne font-bold text-[var(--text-primary)] mb-4">
                Simple, transparent pricing.
              </h2>
              <p className="text-[var(--text-secondary)] text-[16px]">
                Choose the plan that's right for your stage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pricingTiers.map((tier, idx) => (
                <PricingCard key={idx} {...tier} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Strip */}
        <section className="py-24 md:py-32 px-6 bg-[var(--bg-surface)] relative overflow-hidden">
          {/* SVG Noise/Dot pattern placeholder */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FAFAFA 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="max-w-[800px] mx-auto text-center relative z-10">
            <h2 className="text-[32px] md:text-[52px] font-syne font-extrabold text-[var(--text-primary)] leading-tight mb-8">
              Start protecting your <br /> revenue today.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-primary px-10 py-4 text-[16px]">Get Started Now</button>
              <button className="btn-secondary px-10 py-4 text-[16px]">Contact Sales</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
