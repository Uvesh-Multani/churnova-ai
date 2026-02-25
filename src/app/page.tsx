"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Activity, BarChart3, Brain, ChevronRight, Menu, Moon, Sun, X,
  Zap, Shield, TrendingDown, Users, DollarSign, LineChart,
  ArrowRight, Check, Star, Github, Twitter, Linkedin
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Animated counter
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Floating blob background
function FloatingBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-float-slow" style={{ animationDelay: "4s" }} />
    </div>
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass border-b border-white/10 shadow-lg" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Churnova <span className="gradient-text">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Pricing", "Use Cases"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="gradient-bg text-white border-0 hover:opacity-90 shadow-lg shadow-indigo-500/25">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-3"
          >
            {["Features", "How It Works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm text-muted-foreground py-2">
                {item}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/sign-in" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/sign-up" className="flex-1">
                <Button size="sm" className="w-full gradient-bg text-white border-0">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <FloatingBlobs />
        
        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Badge className="glass border border-indigo-500/30 text-indigo-400 px-4 py-1.5 text-xs font-medium">
            <Zap className="w-3 h-3 mr-1.5" />
            New: Isolation Forest v2.0 – 40% more accurate anomaly detection
            <ChevronRight className="w-3 h-3 ml-1" />
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Detect Silent Churn{" "}
            <br className="hidden md:block" />
            <span className="gradient-text">Before It Costs You</span>
            <br className="hidden md:block" />
            Revenue.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            AI-powered SaaS intelligence that identifies engagement decline, abnormal usage
            patterns, and churn risk before customers leave — giving your team time to act.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button size="lg" className="gradient-bg text-white border-0 hover:opacity-90 shadow-xl shadow-indigo-500/30 px-8 h-12 text-base font-medium group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base font-medium glass border-white/20 hover:border-indigo-400/50">
                View Live Demo
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" /> 14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" /> Setup in 5 minutes
            </span>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 max-w-5xl mx-auto relative"
        >
          <div className="glass-card rounded-2xl p-1 border border-white/10 shadow-2xl shadow-indigo-500/10">
            <div className="bg-muted/50 rounded-xl p-6 space-y-4">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 max-w-xs mx-4">
                  <div className="h-6 rounded-md bg-muted skeleton" />
                </div>
                <div className="w-20 h-6 rounded-md bg-muted skeleton" />
              </div>
              {/* Mock KPI cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total Users", value: "12,847", change: "+12%", color: "text-blue-400" },
                  { label: "Active Users", value: "9,234", change: "+8%", color: "text-green-400" },
                  { label: "High Risk", value: "384", change: "+23%", color: "text-red-400" },
                  { label: "Revenue at Risk", value: "$128K", change: "-5%", color: "text-yellow-400" },
                ].map((card) => (
                  <div key={card.label} className="glass rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
                  </div>
                ))}
              </div>
              {/* Mock chart area */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 glass rounded-xl p-3 h-32">
                  <div className="flex items-end gap-1 h-full pb-2">
                    {[40,55,45,70,65,80,72,85,78,90,88,95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-indigo-500/30" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-3 h-32 flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="30 70" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="-30" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="-70" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl blur-2xl -z-10" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: 12847, suffix: "+", label: "Active Users Monitored" },
              { value: 94, suffix: "%", label: "Churn Prediction Accuracy" },
              { value: 128, prefix: "$", suffix: "K", label: "Avg Revenue Saved / Month" },
              { value: 48, suffix: "hrs", label: "Avg Early Warning Time" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp}>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="features" className="py-24 px-4 relative">
        <FloatingBlobs />
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 glass border border-red-500/30 text-red-400">
                The Problem
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Why Silent Churn{" "}
              <span className="gradient-text-warm">Matters</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Most SaaS companies lose 20-30% of revenue to silent churn — customers who stop
              engaging before they cancel. Traditional analytics don&apos;t catch it until it&apos;s too late.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: TrendingDown,
                title: "Engagement Decay",
                desc: "Usage drops gradually over weeks — almost invisible without ML-powered trend analysis.",
                color: "text-red-400",
                bg: "bg-red-500/10",
              },
              {
                icon: Users,
                title: "Invisible Disengagement",
                desc: "Users who log in but don't use core features are on the path to cancellation.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
              },
              {
                icon: DollarSign,
                title: "Revenue Erosion",
                desc: "By the time users cancel, you've already lost months of potential retention revenue.",
                color: "text-orange-400",
                bg: "bg-orange-500/10",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 glass border border-indigo-500/30 text-indigo-400">
                How It Works
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              From Data to <span className="gradient-text">Action in 3 Steps</span>
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-indigo-500/20 via-purple-500/40 to-blue-500/20 -translate-y-1/2" />
            
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  step: "01",
                  icon: Activity,
                  title: "Connect & Ingest",
                  desc: "Upload your CSV usage data or connect via API. Churnova ingests login events, session data, and feature interactions.",
                  color: "from-indigo-500 to-blue-500",
                },
                {
                  step: "02",
                  icon: Brain,
                  title: "AI Analysis",
                  desc: "Our ML engine runs Isolation Forest anomaly detection and linear regression trend analysis across all user cohorts.",
                  color: "from-purple-500 to-indigo-500",
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "Act & Retain",
                  desc: "Get actionable risk scores, AI-generated insights, and recommended retention actions for every at-risk user.",
                  color: "from-blue-500 to-purple-500",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="relative glass-card rounded-2xl p-8 border border-white/8 text-center group hover:border-indigo-500/30 transition-all duration-300"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mb-3 tracking-widest">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 glass border border-purple-500/30 text-purple-400">
                Features
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="gradient-text">Stop Churn</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { icon: Brain, title: "Isolation Forest ML", desc: "Detect abnormal usage patterns with unsupervised anomaly detection. Identifies outliers before they churn." },
              { icon: TrendingDown, title: "Trend Decline Analysis", desc: "Linear regression slope calculation tracks engagement velocity — catch declining users 30 days earlier." },
              { icon: Activity, title: "Real-time Health Scores", desc: "Dynamic risk scoring combines anomaly, trend, and recency signals into actionable 0-100 scores." },
              { icon: BarChart3, title: "Revenue Impact Analysis", desc: "Quantify exact MRR at risk per user segment. Build business cases for retention investment." },
              { icon: LineChart, title: "Engagement Heatmaps", desc: "Visualize usage intensity across time periods. Spot patterns invisible in traditional dashboards." },
              { icon: Zap, title: "AI-Generated Insights", desc: "GPT-powered explanations for every at-risk user. 'User engagement declined 42% over 30 days...' "},
              { icon: Users, title: "Cohort Analysis", desc: "Compare behavior across plan tiers, signup cohorts, and feature adoption segments." },
              { icon: Shield, title: "Retention Playbooks", desc: "AI-recommended actions: email sequences, CSM outreach triggers, feature tutorials." },
              { icon: DollarSign, title: "Export & Integrations", desc: "Export high-risk CSVs, PDF reports, and connect to Salesforce, HubSpot, and Intercom." },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -4, borderColor: "rgba(99, 102, 241, 0.3)" }}
                className="glass-card rounded-2xl p-6 border border-white/8 transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors duration-300">
                  <feature.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="gradient-text">Every SaaS Vertical</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                badge: "SaaS", color: "border-indigo-500/30 text-indigo-400",
                title: "B2B SaaS Platforms",
                points: ["Track seat utilization by workspace", "Identify accounts approaching downgrade", "Monitor onboarding completion rates", "Flag support-heavy churning accounts"],
                metric: "34% reduction in involuntary churn",
              },
              {
                badge: "FinTech", color: "border-purple-500/30 text-purple-400",
                title: "Financial Technology",
                points: ["Monitor transaction frequency decline", "Detect dormant account patterns", "Flag reduced feature engagement", "Identify compliance-related friction"],
                metric: "$2.4M ARR saved per quarter",
              },
              {
                badge: "EdTech", color: "border-blue-500/30 text-blue-400",
                title: "Education Technology",
                points: ["Track course completion velocity", "Identify at-risk learners early", "Monitor cohort engagement drops", "Predict license non-renewal"],
                metric: "22% improvement in renewal rate",
              },
            ].map((uc) => (
              <motion.div
                key={uc.badge}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all duration-300"
              >
                <Badge className={`mb-4 glass border ${uc.color} text-xs`}>{uc.badge}</Badge>
                <h3 className="text-lg font-semibold mb-4">{uc.title}</h3>
                <ul className="space-y-2 mb-6">
                  {uc.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-white/8">
                  <p className="text-sm font-medium text-green-400">{uc.metric}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="gradient-text">Growth Teams</span>
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
            </motion.div>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-sm">4.9/5 from 200+ reviews</motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              {
                quote: "Churnova caught 47 high-risk accounts before our quarterly renewal period. Saved us at least $180K in ARR. The AI insights are eerily accurate.",
                author: "Sarah Chen",
                role: "VP of Customer Success",
                company: "DataPulse Inc.",
                avatar: "SC",
              },
              {
                quote: "We integrated it in 20 minutes and got our first anomaly alerts the same day. The risk score formula is exactly what we needed — no more guesswork.",
                author: "Marcus Rivera",
                role: "Head of Growth",
                company: "Vertex Labs",
                avatar: "MR",
              },
              {
                quote: "The engagement heatmaps changed how our CSM team prioritizes outreach. We're now proactive instead of reactive. Incredible tool.",
                author: "Priya Patel",
                role: "Director of Operations",
                company: "Cloudstream",
                avatar: "PP",
              },
            ].map((t) => (
              <motion.div
                key={t.author}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 border border-white/8 hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 glass border border-indigo-500/30 text-indigo-400">Pricing</Badge>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-4">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground">
              Start free, scale as you grow.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                name: "Starter", price: "$99", period: "/mo",
                desc: "Perfect for early-stage SaaS",
                features: ["Up to 1,000 users", "Basic risk scoring", "CSV export", "Email alerts", "7-day data history"],
                cta: "Start Free Trial",
                highlighted: false,
              },
              {
                name: "Growth", price: "$299", period: "/mo",
                desc: "For scaling SaaS teams",
                features: ["Up to 10,000 users", "Full ML engine", "AI explanations", "PDF reports", "90-day history", "Slack integration", "Priority support"],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "",
                desc: "For large-scale operations",
                features: ["Unlimited users", "Custom ML models", "SSO & SAML", "Dedicated CSM", "SLA guarantee", "API access", "White-label"],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className={`relative glass-card rounded-2xl p-7 border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-indigo-500/50 shadow-xl shadow-indigo-500/10"
                    : "border-white/8 hover:border-white/15"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-bg text-white border-0 shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground mb-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button
                    className={`w-full h-10 ${plan.highlighted ? "gradient-bg text-white border-0 hover:opacity-90" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Start Detecting Churn{" "}
              <span className="gradient-text">Today</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-10">
              Join 500+ SaaS companies using Churnova AI to protect their revenue and retain more customers.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gradient-bg text-white border-0 hover:opacity-90 shadow-xl shadow-indigo-500/30 px-10 h-12 text-base font-medium">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="px-10 h-12 text-base font-medium glass border-white/20">
                  View Live Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold">Churnova <span className="gradient-text">AI</span></span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Predict. Protect. Prevent Churn. AI-powered SaaS intelligence platform.
              </p>
              <div className="flex gap-3 mt-4">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center hover:border-indigo-500/40 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 Churnova AI Inc. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Built with Next.js, FastAPI & Machine Learning</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
