"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/badge";
import { Mail, MapPin, Phone, Github, Twitter, Linkedin } from "lucide-react";

export default function AboutPage() {
    const team = [
        {
            name: "Alex River",
            role: "CEO & Co-founder",
            avatar: "AR"
        },
        {
            name: "Sarah Chen",
            role: "CTO & Co-founder",
            avatar: "SC"
        },
        {
            name: "Marcus Thorne",
            role: "Head of Product",
            avatar: "MT"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow pt-[120px]">
                {/* Mission Hero */}
                <section className="px-6 mb-32">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <Badge className="mb-8">About Us</Badge>
                        <h1 className="text-[42px] md:text-[52px] font-syne font-extrabold text-[var(--text-primary)] mb-8 leading-tight max-w-[900px] mx-auto">
                            Our mission is to help SaaS teams build <br />
                            <span className="text-[var(--accent-primary)]">unbreakable customer relationships.</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-[18px] max-w-[720px] mx-auto leading-relaxed">
                            We started Churnova because we saw a gap in how companies handle customer retention.
                            Instead of reacting to cancellations, we want teams to proactively nurture
                            every user through deep behavioral intelligence.
                        </p>
                    </div>
                </section>

                {/* Team Section */}
                <section className="px-6 py-24 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)]">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-[32px] font-syne font-bold text-[var(--text-primary)] mb-16 text-center">
                            Meet the team
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {team.map((member) => (
                                <div key={member.name} className="card flex flex-col items-center text-center p-10">
                                    <div className="w-20 h-20 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[24px] font-syne font-bold text-[var(--accent-primary)] mb-6">
                                        {member.avatar}
                                    </div>
                                    <h3 className="text-[20px] font-syne font-bold text-[var(--text-primary)] mb-2">
                                        {member.name}
                                    </h3>
                                    <p className="text-[var(--text-muted)] text-[14px]">
                                        {member.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="px-6 py-24 lg:py-32">
                    <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
                        <div>
                            <Badge className="mb-4">Contact</Badge>
                            <h2 className="text-[32px] md:text-[42px] font-syne font-bold text-[var(--text-primary)] mb-8">
                                Get in touch with us.
                            </h2>
                            <p className="text-[var(--text-secondary)] text-[16px] mb-12 leading-relaxed max-w-[480px]">
                                Have questions about our platform or want to see a custom demo?
                                Our team is here to help you solve your churn challenges.
                            </p>

                            <div className="flex flex-col gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-[var(--accent-primary)]">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email</p>
                                        <p className="text-[var(--text-primary)] font-medium">hello@churnova.ai</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-[var(--accent-primary)]">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Office</p>
                                        <p className="text-[var(--text-primary)] font-medium">San Francisco, CA</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex gap-6">
                                <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                    <Twitter size={24} />
                                </Link>
                                <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                    <Github size={24} />
                                </Link>
                                <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                    <Linkedin size={24} />
                                </Link>
                            </div>
                        </div>

                        <div className="card p-8 md:p-12">
                            <form className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</label>
                                        <input type="text" placeholder="John Doe" className="input" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Email</label>
                                        <input type="email" placeholder="john@company.com" className="input" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Subject</label>
                                    <input type="text" placeholder="I'd like to request a demo" className="input" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Message</label>
                                    <textarea placeholder="Tell us about your churn challenges..." className="input min-h-[160px] pt-4 resize-none"></textarea>
                                </div>
                                <button type="submit" className="btn-primary w-full py-4 text-[16px] font-bold">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

// Minimal missing Link component import from next/link
import Link from "next/link";
