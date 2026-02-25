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

    return (
        <footer className="bg-[var(--bg-base)] border-top border-[var(--border-subtle)] pt-16 pb-8">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Col */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-1">
                            <span className="font-syne font-bold text-xl tracking-tight text-[var(--text-primary)]">
                                CHURNOVA<span className="text-[var(--accent-primary)]">.</span>
                            </span>
                        </Link>
                        <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed max-w-[240px]">
                            Intelligent Usage Health & Silent Churn Detection for modern SaaS teams.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                <Github size={20} />
                            </Link>
                            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Links Cols */}
                    {footerGroups.map((group) => (
                        <div key={group.title} className="flex flex-col gap-6">
                            <h4 className="font-dm-sans font-semibold text-[14px] uppercase tracking-wider text-[var(--text-primary)]">
                                {group.title}
                            </h4>
                            <div className="flex flex-col gap-3">
                                {group.links.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[14px] transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[var(--text-muted)] text-[13px]">
                        © {currentYear} Churnova AI. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[13px] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[13px] transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[13px] transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
