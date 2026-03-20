"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
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
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled ? "pt-3 px-4 md:px-8" : "pt-5 px-6 md:px-10"
                }`}
            >
                <div
                    className={`max-w-[1120px] mx-auto flex items-center justify-between transition-all duration-500 ${
                        scrolled
                            ? "navbar-floating px-5 py-2.5"
                            : "px-2 py-2"
                    }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 group">
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2L14 6V14L8 10L2 14V6L8 2Z" fill="white" fillOpacity="0.9"/>
                            </svg>
                        </div>
                        <span className="font-syne font-bold text-lg tracking-tight text-[var(--text-primary)]">
                            churnova<span className="text-[var(--accent-primary)]">.</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-7">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="nav-link font-dm-sans font-medium text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="font-dm-sans font-medium text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5">
                                    Log in
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn-primary gradient-bg px-5 py-2 text-[13px] rounded-full">
                                    Get Started <ArrowRight size={14} className="ml-1.5 inline" />
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="btn-primary gradient-bg px-5 py-2 text-[13px] rounded-full"
                            >
                                Dashboard <ArrowRight size={14} className="ml-1.5 inline" />
                            </Link>
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-8 h-8 border border-[var(--border-subtle)]"
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-primary)]"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer — Full overlay */}
            {isOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[var(--border-subtle)] z-50 pt-20 pb-8 px-6 flex flex-col gap-5 shadow-xl"
                        style={{ animation: 'slide-up 300ms ease forwards' }}
                    >
                        <button
                            className="absolute top-5 right-5 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={20} />
                        </button>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="font-dm-sans font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-subtle)]">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="btn-secondary w-full py-3">Log in</button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="btn-primary gradient-bg w-full py-3">Get Started</button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className="btn-primary gradient-bg w-full text-center py-3" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                <div className="flex justify-center pt-2">
                                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-border" } }} />
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;
