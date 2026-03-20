import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerGroups = [
        {
            title: "Product",
            links: [
                { name: "Features", href: "#" },
                { name: "Pricing", href: "/pricing" },
                { name: "Docs", href: "/docs" },
                { name: "Change Log", href: "#" },
            ],
        },
        {
            title: "Resources",
            links: [
                { name: "Blog", href: "#" },
                { name: "Community", href: "#" },
                { name: "Help Center", href: "#" },
                { name: "System Status", href: "#" },
            ],
        },
        {
            title: "Company",
            links: [
                { name: "About", href: "/about" },
                { name: "Careers", href: "#" },
                { name: "Privacy", href: "#" },
                { name: "Terms", href: "#" },
            ],
        },
    ];

    const socialLinks = [
        { icon: Github, href: "#", label: "GitHub" },
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Linkedin, href: "#", label: "LinkedIn" },
    ];

    return (
        <footer className="bg-[var(--bg-base)] relative">
            {/* Gradient divider */}
            <div className="section-divider" />

            <div className="max-w-[1100px] mx-auto px-6 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
                    {/* Brand Col — takes 2 cols */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-1.5 group w-fit">
                            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2L14 6V14L8 10L2 14V6L8 2Z" fill="white" fillOpacity="0.9"/>
                                </svg>
                            </div>
                            <span className="font-syne font-bold text-lg tracking-tight text-[var(--text-primary)]">
                                churnova<span className="text-[var(--accent-primary)]">.</span>
                            </span>
                        </Link>
                        <p className="text-[var(--text-muted)] text-[14px] leading-[1.7] max-w-[280px]">
                            Intelligent Usage Health & Silent Churn Detection for modern SaaS teams.
                        </p>
                        <div className="flex gap-3 mt-1">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] hover:bg-indigo-50/50 transition-all duration-200"
                                >
                                    <Icon size={16} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Cols */}
                    {footerGroups.map((group) => (
                        <div key={group.title} className="flex flex-col gap-5">
                            <h4 className="font-dm-sans font-semibold text-[13px] uppercase tracking-[0.1em] text-[var(--text-primary)]">
                                {group.title}
                            </h4>
                            <div className="flex flex-col gap-3">
                                {group.links.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] text-[13.5px] transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[var(--text-muted)] text-[12px]">
                        © {currentYear} Churnova AI. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {["Privacy Policy", "Terms of Service", "Cookies"].map(item => (
                            <Link
                                key={item}
                                href="#"
                                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-[12px] transition-colors duration-200"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
