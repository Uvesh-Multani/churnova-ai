"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, ChevronRight, Book, Terminal, Settings, Puzzle, FileText } from "lucide-react";

const SidebarItem = ({ icon: Icon, title, href, active = false }: { icon: any, title: string, href: string, active?: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all ${active
                ? "bg-[var(--bg-elevated)] border-l-2 border-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
    >
        <Icon size={18} />
        <span className="font-dm-sans text-[14px] font-medium">{title}</span>
    </Link>
);

export default function DocsPage() {
    const sidebarSections = [
        {
            title: "Getting Started",
            items: [
                { icon: Book, title: "Introduction", href: "#" },
                { icon: Terminal, title: "Quickstart", href: "#", active: true },
                { icon: Terminal, title: "Installation", href: "#" },
            ]
        },
        {
            title: "Core Concepts",
            items: [
                { icon: FileText, title: "Events & Identity", href: "#" },
                { icon: FileText, title: "Behavioral Signals", href: "#" },
                { icon: FileText, title: "Health Scoring", href: "#" },
            ]
        },
        {
            title: "Integrations",
            items: [
                { icon: Puzzle, title: "React / Next.js", href: "#" },
                { icon: Puzzle, title: "Python SDK", href: "#" },
                { icon: Settings, title: "API Reference", href: "#" },
            ]
        }
    ];

    const pageTOC = [
        "Overview",
        "Pre-requisites",
        "Step 1: Get API Key",
        "Step 2: Install SDK",
        "Step 3: Track Events",
        "Next Steps"
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-base)]">
            <Navbar />

            <div className="max-w-[1400px] mx-auto w-full flex-grow flex pt-[80px]">
                {/* Left Sidebar */}
                <aside className="hidden lg:flex w-[280px] flex-col border-r border-[var(--border-subtle)] p-6 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md py-2 pl-10 pr-4 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                    </div>

                    <div className="flex flex-col gap-8">
                        {sidebarSections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-2">
                                <h4 className="px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                                    {section.title}
                                </h4>
                                {section.items.map((item) => (
                                    <SidebarItem key={item.title} {...item} />
                                ))}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow p-8 md:p-12 lg:p-16 max-w-[800px]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-[13px] mb-8">
                        <Link href="#" className="hover:text-[var(--text-primary)]">Docs</Link>
                        <ChevronRight size={14} />
                        <span className="text-[var(--text-primary)]">Quickstart</span>
                    </div>

                    <article className="prose prose-invert max-w-none">
                        <h1 className="text-[42px] font-syne font-extrabold text-[var(--text-primary)] mb-4">
                            Quickstart Guide
                        </h1>
                        <p className="text-[18px] text-[var(--text-secondary)] mb-12">
                            Learn how to integrate Churnova AI into your application and start detecting churn signals in less than 5 minutes.
                        </p>

                        <h2 className="text-[24px] font-syne font-bold text-[var(--text-primary)] mt-12 mb-6">
                            1. Get your API Key
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Create a free account on the Churnova Dashboard and navigate to <strong>Settings &gt; API Keys</strong> to generate your unique tracking token.
                        </p>

                        <h2 className="text-[24px] font-syne font-bold text-[var(--text-primary)] mt-12 mb-6">
                            2. Install the SDK
                        </h2>
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 mb-6 relative">
                            <pre className="text-[var(--text-primary)] font-mono text-[14px]">
                                <code>npm install @churnova/analytics</code>
                            </pre>
                            <button className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[12px]">Copy</button>
                        </div>

                        <h2 className="text-[24px] font-syne font-bold text-[var(--text-primary)] mt-12 mb-6">
                            3. Initialize and Track
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Import the library and initialize it with your API key. We recommend doing this at the entry point of your application.
                        </p>
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 mb-6 relative overflow-hidden">
                            <pre className="text-[var(--text-secondary)] font-mono text-[13px] leading-relaxed">
                                <code>
                                    <span className="text-[var(--accent-alt)]">import</span> Churnova <span className="text-[var(--accent-alt)]">from</span> <span className="text-[var(--accent-primary)]">'@churnova/analytics'</span>;<br /><br />
                                    <span className="text-[var(--text-muted)]">// Initialize the client</span><br />
                                    <span className="text-[var(--accent-alt)]">const</span> churnova = <span className="text-[var(--accent-alt)]">new</span> Churnova(<span className="text-[var(--accent-primary)]">'YOUR_API_KEY'</span>);<br /><br />
                                    <span className="text-[var(--text-muted)]">// Track an important user action</span><br />
                                    churnova.<span className="text-[var(--accent-primary)]">track</span>(<span className="text-[var(--accent-primary)]">'project_created'</span>, &#123;<br />
                                    &nbsp;&nbsp;plan: <span className="text-[var(--accent-primary)]">'Pro'</span>,<br />
                                    &nbsp;&nbsp;value: <span className="text-[var(--destructive)]">49.00</span><br />
                                    &#125;);
                                </code>
                            </pre>
                        </div>

                        <div className="mt-20 pt-10 border-t border-[var(--border-subtle)] flex justify-between items-center text-[14px]">
                            <span className="text-[var(--text-muted)]">Was this page helpful?</span>
                            <div className="flex gap-4">
                                <button className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded hover:border-[var(--border-default)]">Yes</button>
                                <button className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded hover:border-[var(--border-default)]">No</button>
                            </div>
                        </div>
                    </article>
                </main>

                {/* Right Sidebar (TOC) */}
                <aside className="hidden xl:flex w-[240px] flex-col py-16 px-6 sticky top-[80px] h-[calc(100vh-80px)]">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                        On this page
                    </h4>
                    <div className="flex flex-col gap-3">
                        {pageTOC.map(item => (
                            <Link key={item} href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>

            <Footer />
        </div>
    );
}
