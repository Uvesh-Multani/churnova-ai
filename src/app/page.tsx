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
  ArrowRight,
  Play
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
      tier: "Free",
      price: "$0",
      description: "Perfect for testing Churnova with limited data.",
      features: [
        "Up to 10 customers",
        "Basic anomaly detection",
        "Standard dashboard access",
        "Email support"
      ],
      ctaText: "Start for Free",
      ctaHref: "/dashboard"
    },
    {
      tier: "Basic",
      price: "$4.99",
      description: "Essential insights for growing projects.",
      features: [
        "Up to 100 customers",
        "Advanced AI risk models",
        "Slack & Email alerts",
        "Retention health score",
        "Priority email support"
      ],
      ctaText: "Get Basic",
      ctaHref: "/pricing",
      isPopular: true
    },
    {
      tier: "Pro",
      price: "$12.99",
      description: "Powerful churn prevention for scale.",
      features: [
        "Up to 1,000 customers",
        "Custom ML model training",
        "Real-time anomaly heartbeats",
        "Full behavioral history",
        "Priority 24/7 support"
      ],
      ctaText: "Upgrade to Pro",
      ctaHref: "/pricing"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-[80px]">
        {/* ═══ Hero Section ═══ */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-6">
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-indigo-200/20 blur-[120px] animate-gradient-shift" />
            <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-200/15 blur-[100px] animate-gradient-shift" style={{ animationDelay: '4s' }} />
            <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] rounded-full bg-pink-200/10 blur-[80px] animate-gradient-shift" style={{ animationDelay: '2s' }} />
          </div>

          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="max-w-[1100px] mx-auto text-center relative z-10">
            <div
              ref={(el) => { if (el) animatedRefs.current[0] = el; }}
              className="fade-up"
              style={{ transitionDelay: "0ms" }}
            >
              <Badge className="mb-8 py-1.5 px-4 text-[11px]">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Now in Public Beta
              </Badge>
            </div>

            <h1
              ref={(el) => { if (el) animatedRefs.current[1] = el; }}
              className="fade-up text-[48px] md:text-[76px] lg:text-[84px] font-syne font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)] mb-7"
              style={{ transitionDelay: "100ms" }}
            >
              Analyze Churn. <br />
              <span className="gradient-text">Connect in Minutes.</span>
            </h1>

            <p
              ref={(el) => { if (el) animatedRefs.current[2] = el; }}
              className="fade-up text-[var(--text-muted)] text-[17px] md:text-[19px] max-w-[580px] mx-auto mb-10 leading-[1.7]"
              style={{ transitionDelay: "200ms" }}
            >
              Ingest telemetry directly from your SaaS via our simple tracking API.
              Let our intelligent ML models detect engagement decline before customers leave.
            </p>

            <div
              ref={(el) => { if (el) animatedRefs.current[3] = el; }}
              className="fade-up flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
              style={{ transitionDelay: "300ms" }}
            >
              <a href="/dashboard/connect" className="btn-primary gradient-bg px-8 py-3.5 text-[15px] rounded-xl shadow-[var(--shadow-glow)] hover:shadow-[0_0_60px_-12px_rgba(99,102,241,0.6)] transition-shadow">
                Connect Your Data
                <ArrowRight size={16} className="ml-2 inline" />
              </a>
              <a href="/docs" className="btn-secondary px-8 py-3.5 text-[15px] rounded-xl gap-2">
                <Play size={14} className="mr-1" /> View API Docs
              </a>
            </div>

            {/* Trusted by logos — marquee */}
            <div
              ref={(el) => { if (el) animatedRefs.current[4] = el; }}
              className="fade-up"
              style={{ transitionDelay: "450ms" }}
            >
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.2em] font-semibold mb-6 opacity-50">
                Trusted by 500+ teams worldwide
              </p>
              <div className="overflow-hidden relative max-w-[700px] mx-auto">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10" />
                <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                  {[...["AcmeCorp", "Globex", "Initech", "Umbrella", "Cyberdyne", "Hooli"], ...["AcmeCorp", "Globex", "Initech", "Umbrella", "Cyberdyne", "Hooli"]].map((logo, i) => (
                    <span key={`${logo}-${i}`} className="text-[18px] font-syne font-extrabold tracking-tighter text-[var(--text-muted)] opacity-30 hover:opacity-60 transition-opacity">
                      {logo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Features Grid ═══ */}
        <section className="bg-[var(--bg-base)] py-24 md:py-32 px-6 relative">
          <div className="section-divider absolute top-0 left-0 right-0" />

          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4">Why teams choose us</Badge>
              <h2 className="text-[32px] md:text-[40px] font-syne font-bold text-[var(--text-primary)] leading-tight">
                Everything you need to <br />save your revenue.
              </h2>
              <p className="text-[var(--text-muted)] text-[15px] mt-4 max-w-[440px] mx-auto leading-relaxed">
                From real-time detection to AI insights, we&apos;ve built the complete toolkit for proactive retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  ref={(el) => { if (el) animatedRefs.current[5 + idx] = el; }}
                  className="fade-up"
                  style={{ transitionDelay: `${idx * 60}ms` }}
                >
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Showcase Section — How it works ═══ */}
        <section className="py-24 md:py-32 px-6 bg-[var(--bg-base)] overflow-hidden relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-[1100px] mx-auto flex flex-col gap-28 relative z-10">
            {/* Step 1 – Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative">
                <span className="absolute -top-10 -left-6 text-[80px] md:text-[120px] font-syne font-extrabold text-[var(--bg-elevated)] select-none z-0 opacity-60">01</span>
                <div className="relative z-10">
                  <Badge className="mb-4">Integration</Badge>
                  <h3 className="text-[26px] md:text-[36px] font-syne font-bold text-[var(--text-primary)] mb-5 leading-tight">
                    Connect your data <br />in minutes.
                  </h3>
                  <p className="text-[var(--text-muted)] text-[15px] leading-[1.7] mb-7 max-w-[440px]">
                    Single API integration that captures every meaningful user interaction.
                    Compatible with your existing tech stack out of the box.
                  </p>
                  <ul className="flex flex-col gap-3">
                    {["Next.js & React Native", "Python & Node.js", "Segment & PostHog"].map(item => (
                      <li key={item} className="flex items-center gap-3 text-[var(--text-secondary)] text-[14px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Terminal code block */}
              <div className="terminal-block">
                <div className="terminal-header">
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                  <span className="terminal-title">churnova.ts</span>
                </div>
                <pre className="p-5 font-mono text-[13px] text-gray-300 overflow-x-auto leading-relaxed">
                  <code>{`// Initialize Churnova
const analytics = new Churnova('YOUR_API_KEY');

// Identify user
analytics.identify('user_123', {
  plan: 'Pro',
  signup_date: '2023-01-01'
});

// Track event
analytics.track('api_call_success');`}</code>
                </pre>
              </div>
            </div>

            {/* Step 2 – Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="lg:order-2 relative">
                <span className="absolute -top-10 -left-6 text-[80px] md:text-[120px] font-syne font-extrabold text-[var(--bg-elevated)] select-none z-0 opacity-60">02</span>
                <div className="relative z-10">
                  <Badge className="mb-4">Visualization</Badge>
                  <h3 className="text-[26px] md:text-[36px] font-syne font-bold text-[var(--text-primary)] mb-5 leading-tight">
                    See the health of <br />your entire customer base.
                  </h3>
                  <p className="text-[var(--text-muted)] text-[15px] leading-[1.7] mb-8 max-w-[440px]">
                    Beautiful, data-dense dashboards that highlight abnormal trends and
                    behavioral anomalies across your entire user population.
                  </p>
                  <a href="/dashboard" className="btn-secondary rounded-xl text-[14px]">
                    Explore Dashboard <ArrowRight size={14} className="ml-2 inline" />
                  </a>
                </div>
              </div>

              {/* Dashboard preview mock */}
              <div className="lg:order-1 bg-[var(--bg-warm)] border border-[var(--border-subtle)] rounded-2xl aspect-[4/3] relative overflow-hidden shadow-[var(--shadow-card)]">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full h-[80%] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-base)] p-5 flex flex-col gap-4">
                    {/* Mini header */}
                    <div className="flex justify-between items-center">
                      <div className="w-20 h-3 bg-[var(--bg-elevated)] rounded-full" />
                      <div className="flex gap-2">
                        <div className="w-12 h-3 bg-indigo-100 rounded-full" />
                        <div className="w-8 h-3 bg-[var(--bg-elevated)] rounded-full" />
                      </div>
                    </div>
                    {/* Mini KPI row */}
                    <div className="flex gap-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex-1 rounded-lg bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)]">
                          <div className="w-6 h-1.5 bg-[var(--bg-elevated)] rounded-full mb-2" />
                          <div className="w-10 h-3 bg-indigo-200/50 rounded-full" />
                        </div>
                      ))}
                    </div>
                    {/* Mini chart */}
                    <div className="flex-grow flex items-end gap-1.5 px-1">
                      {[40, 60, 45, 80, 55, 90, 70, 65, 85, 50].map((h, i) => (
                        <div key={i} className="flex-grow rounded-t-sm" style={{ height: `${h}%`, background: `rgba(99, 102, 241, ${0.15 + (h/100) * 0.5})` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Pricing ═══ */}
        <section className="py-24 md:py-32 px-6 bg-[var(--bg-base)] relative">
          <div className="section-divider absolute top-0 left-0 right-0" />

          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-[32px] md:text-[40px] font-syne font-bold text-[var(--text-primary)] mb-3 leading-tight">
                Simple, transparent pricing.
              </h2>
              <p className="text-[var(--text-muted)] text-[15px] max-w-[400px] mx-auto">
                Choose the plan that&apos;s right for your stage. Upgrade anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {pricingTiers.map((tier, idx) => (
                <PricingCard key={idx} {...tier} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA Section ═══ */}
        <section className="py-24 md:py-32 px-6 bg-[var(--bg-surface)] relative overflow-hidden">
          <div className="section-divider absolute top-0 left-0 right-0" />

          {/* Decorative backgrounds */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/30 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-[720px] mx-auto text-center relative z-10">
            <Badge className="mb-6">Start Today</Badge>
            <h2 className="text-[34px] md:text-[52px] font-syne font-extrabold text-[var(--text-primary)] leading-[1.08] mb-5 tracking-tight">
              Start protecting your <br />revenue today.
            </h2>
            <p className="text-[var(--text-muted)] text-[16px] max-w-[480px] mx-auto mb-10 leading-relaxed">
              Join 500+ teams who trust Churnova to predict churn and protect their recurring revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="btn-primary gradient-bg px-10 py-4 text-[15px] rounded-xl shadow-[var(--shadow-glow)]" onClick={() => window.location.href = '/dashboard'}>
                Get Started Free
                <ArrowRight size={16} className="ml-2 inline" />
              </button>
              <button className="btn-secondary px-10 py-4 text-[15px] rounded-xl" onClick={() => window.location.href = '/pricing'}>
                View Pricing
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
