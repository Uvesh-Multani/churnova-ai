"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Rocket, ArrowRight, Zap, Shield, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function OnboardingPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Failed to create project");

            const project = await res.json();
            toast.success("Project created successfully!");
            router.push(`/dashboard?projectId=${project.id}`);
        } catch (error) {
            toast.error("Error creating project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base flex items-center justify-center p-6 bg-[var(--gradient-hero)]">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent-primary)] text-[var(--bg-base)] mb-6 shadow-[0_0_20px_rgba(245,197,66,0.2)]">
                        <Rocket size={24} />
                    </div>
                    <h1 className="text-3xl font-syne font-bold text-primary mb-2">Welcome to Churnova</h1>
                    <p className="text-muted-foreground">Let's set up your first project to start tracking health.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-surface border-border p-8"
                >
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary-foreground">Project Name</label>
                            <Input
                                placeholder="e.g. Acme SaaS"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                className="bg-base border-border focus:border-primary"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full bg-primary text-base hover:scale-[1.02] transition-all h-11"
                        >
                            {loading ? "Creating..." : "Generate API Key"}
                            {!loading && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-primary mb-1 flex justify-center"><Key size={16} /></div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Secure Keys</p>
                        </div>
                        <div className="text-center">
                            <div className="text-primary mb-1 flex justify-center"><Shield size={16} /></div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Encrypted</p>
                        </div>
                        <div className="text-center">
                            <div className="text-primary mb-1 flex justify-center"><Zap size={16} /></div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Real-time</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
