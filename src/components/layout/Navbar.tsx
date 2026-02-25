"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Product", href: "#" },
        { name: "Features", href: "#" },
        { name: "Pricing", href: "/pricing" },
        { name: "Docs", href: "/docs" },
        { name: "Blog", href: "#" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "h-[60px] bg-[rgba(9,9,11,0.85)] backdrop-blur-md border-b border-[var(--border-subtle)]"
                : "h-[80px] bg-transparent"
                }`}
        >
            <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1">
                    <span className="font-syne font-bold text-xl tracking-tight text-[var(--text-primary)]">
                        CHURNOVA<span className="text-[var(--accent-primary)]">.</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="font-dm-sans font-medium text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop CTAs */}
                <div className="hidden md:flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="btn-secondary px-4 py-2 border-none hover:bg-transparent">Log in</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="btn-primary">Get Started</button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard" className="btn-secondary px-4 py-2 border-none hover:bg-transparent">Dashboard</Link>
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-9 h-9 border border-border"
                                }
                            }}
                        />
                    </SignedIn>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-[var(--text-primary)]"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="md:hidden absolute top-[60px] left-0 right-0 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="font-dm-sans font-medium text-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 pt-4">
                        <button className="btn-secondary w-full">Log in</button>
                        <button className="btn-primary w-full">Get Started</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
