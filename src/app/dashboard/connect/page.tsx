"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, Code2, Server, Key, Download, RefreshCw, Eye, EyeOff, Plus, Trash2, CreditCard, Globe, Boxes, ChevronDown, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const StripeImg = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img src="/stripe-payment-icon.png" alt="Stripe" {...props} />;
const RazorpayImg = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img src="/razorpay-icon.png" alt="Razorpay" {...props} />;
const PaddleImg = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img src="/paddle-p.png" alt="Paddle" {...props} />;
const DodoImg = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img src="/dodo.jpeg" alt="Dodo" {...props} />;

const INTEGRATION_PROVIDERS = [
    { id: "stripe", name: "Stripe", icon: StripeImg, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10", desc: "Sync customers, subscriptions, and MRR." },
    { id: "dodo", name: "Dodo Payments", icon: DodoImg, color: "text-emerald-400", bg: "bg-emerald-400/10", desc: "Global MoR integration for international billing." },
    { id: "paddle", name: "Paddle", icon: PaddleImg, color: "text-amber-400", bg: "bg-amber-400/10", desc: "SaaS commerce platform and billing." },
    { id: "razorpay", name: "Razorpay", icon: RazorpayImg, color: "text-current", bg: "bg-blue-500/10", desc: "Payment gateway for India & beyond." }
];

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
}

export default function ConnectDataPage() {
    const { activeProjectId } = useAppStore();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<"billing" | "api">("billing");

    // API Key State
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoadingKeys, setIsLoadingKeys] = useState(true);
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState("node");

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreatingKey, setIsCreatingKey] = useState(false);

    // Billing Integration State
    const [selectedGatewayId, setSelectedGatewayId] = useState<string>("stripe");
    const [gatewayKeyInputs, setGatewayKeyInputs] = useState<Record<string, string>>({});
    const [savingBilling, setSavingBilling] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!activeProjectId) return;
            setIsLoadingKeys(true);
            try {
                const res = await fetch(`/api/projects/${activeProjectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setGatewayKeyInputs({
                        stripe: data.stripeKey || "",
                        dodo: data.dodoWebhookUrl || "", // We repurpose this field or could add dedicated schema
                        paddle: data.paddleKey || "",
                        razorpay: data.razorpayKey || "",
                    });
                }

                const keyRes = await fetch(`/api/projects/${activeProjectId}/keys`);
                if (keyRes.ok) {
                    const keyData = await keyRes.json();
                    setApiKeys(keyData.apiKeys || []);
                }
            } catch (e) {
                console.error("Error connecting to server.");
            } finally {
                setIsLoadingKeys(false);
            }
        };

        fetchProjectDetails();
    }, [activeProjectId]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };

    const handleDragLeave = () => {
        setIsDraggingFile(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            // Razorpay CSV Key parsing
            if (text.includes("Key Id") && text.includes("Key Secret")) {
                const lines = text.split("\n").filter(l => l.trim().length > 0);
                if (lines.length >= 2) {
                    const vals = lines[1].split(",");
                    if (vals.length >= 2) {
                        setGatewayKeyInputs(prev => ({
                            ...prev,
                            razorpayId: vals[0].trim(),
                            razorpaySecret: vals[1].trim()
                        }));
                        toast.success("API Keys extracted securely!");
                    }
                }
            } else {
                toast.error("Unrecognized API Key format. Expecting 'Key Id,Key Secret'.");
            }
        };
        reader.readAsText(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            if (text.includes("Key Id") && text.includes("Key Secret")) {
                const lines = text.split("\n").filter(l => l.trim().length > 0);
                if (lines.length >= 2) {
                    const vals = lines[1].split(",");
                    if (vals.length >= 2) {
                        setGatewayKeyInputs(prev => ({
                            ...prev,
                            razorpayId: vals[0].trim(),
                            razorpaySecret: vals[1].trim()
                        }));
                        toast.success("API Keys extracted securely!");
                    }
                }
            } else {
                 toast.error("Unrecognized API Key format. Expecting 'Key Id,Key Secret'.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input so same file can be selected again if needed
    };

    const handleCopy = (id: string, keyString: string) => {
        navigator.clipboard.writeText(keyString);
        setCopiedKeyId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    const toggleReveal = (id: string) => {
        const newSet = new Set(revealedKeys);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setRevealedKeys(newSet);
    };

    const handleCreateKey = async () => {
        if (!activeProjectId || !newKeyName.trim()) return;
        setIsCreatingKey(true);
        try {
            const res = await fetch(`/api/projects/${activeProjectId}/keys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName.trim() }),
            });
            if (!res.ok) throw new Error("Failed to create key");
            const newKey = await res.json();
            setApiKeys([newKey, ...apiKeys]);
            setIsCreateModalOpen(false);
            setNewKeyName("");
            toast.success("API Key generated successfully!");
        } catch (error) {
            toast.error("Failed to generate API Key");
        } finally {
            setIsCreatingKey(false);
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        if (!activeProjectId) return;
        try {
            const res = await fetch(`/api/projects/${activeProjectId}/keys`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyId }),
            });
            if (!res.ok) throw new Error("Failed to delete key");
            setApiKeys(apiKeys.filter(k => k.id !== keyId));
            toast.success("API Key deleted");
        } catch (error) {
            toast.error("Failed to delete API Key");
        }
    };

    const handleSaveBilling = async () => {
        if (!activeProjectId) return;

        let computedRazorpayKey = gatewayKeyInputs.razorpay;
        if (selectedGatewayId === "razorpay") {
            const keyId = (gatewayKeyInputs.razorpayId || "").trim();
            const keySecret = (gatewayKeyInputs.razorpaySecret || "").trim();
            if (!keyId.startsWith("rzp_live_") && !keyId.startsWith("rzp_test_")) {
                toast.error("Razorpay Key ID must start with rzp_live_ or rzp_test_");
                return;
            }
            if (!keySecret) {
                toast.error("Razorpay Key Secret is required");
                return;
            }
            computedRazorpayKey = `${keyId}:${keySecret}`;
        }

        setSavingBilling(true);
        try {
            const payload = {
                stripeKey: gatewayKeyInputs.stripe,
                dodoWebhookUrl: gatewayKeyInputs.dodo,
                paddleKey: gatewayKeyInputs.paddle,
                razorpayKey: computedRazorpayKey,
            };
            const res = await fetch(`/api/projects/${activeProjectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                if (selectedGatewayId === "razorpay") {
                    toast.success("Razorpay credentials saved. Syncing real data...");
                    const syncRes = await fetch(`/api/internal/sync-razorpay`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ projectId: activeProjectId }),
                    });
                    const syncData = await syncRes.json();
                    if (syncRes.ok) {
                        const stats = syncData.stats;
                        toast.success(
                            stats
                                ? `Synced ${stats.totalSynced} records (${stats.customers} customers, ${stats.payments} payments)`
                                : syncData.message || "Razorpay data synced!"
                        );
                        // Auto-navigate to Users page after a short delay so user sees their data
                        setTimeout(() => {
                            router.push("/dashboard/users");
                        }, 2000);
                    } else {
                        toast.error(syncData.error || "Failed to sync Razorpay data.");
                    }
                    setGatewayKeyInputs(prev => ({ ...prev, razorpay: computedRazorpayKey }));
                } else {
                    toast.success(`${INTEGRATION_PROVIDERS.find(p => p.id === selectedGatewayId)?.name} connected successfully.`);
                }
            } else {
                toast.error("Failed to save credentials");
            }
        } catch (e) {
            toast.error("Error saving credentials");
        } finally {
            setSavingBilling(false);
        }
    };

    const displayKeyForSnippet = apiKeys.length > 0 ? apiKeys[0].key : "YOUR_API_KEY";

    const snippets = {
        node: `// Send telemetry to Churnova API
fetch("https://api.churnova.com/track", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${displayKeyForSnippet}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    externalId: "user_12345", // Required: Your user's ID
    email: "customer@example.com",
    name: "Jane Doe",
    company: "Acme Corp",
    loginFrequency: 5.2, // Logins per week
    avgSessionDuration: 24, // Minutes
    featureUsageRate: 85 // Percentage
  })
});`,
        python: `import requests
import json

url = "https://api.churnova.com/track"
headers = {
    "Authorization": "Bearer ${displayKeyForSnippet}",
    "Content-Type": "application/json"
}
data = {
    "externalId": "user_12345", # Required
    "email": "customer@example.com",
    "name": "Jane Doe",
    "company": "Acme Corp",
    "loginFrequency": 5.2,
    "avgSessionDuration": 24,
    "featureUsageRate": 85
}

response = requests.post(url, headers=headers, json=data)`,
        curl: `curl -X POST https://api.churnova.com/track \\
  -H "Authorization: Bearer ${displayKeyForSnippet}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "externalId": "user_12345",
    "email": "customer@example.com",
    "name": "Jane Doe",
    "company": "Acme Corp",
    "loginFrequency": 5.2,
    "avgSessionDuration": 24,
    "featureUsageRate": 85
  }'`
    };

    const getTabName = (key: string) => key === 'node' ? 'Node.js' : key.charAt(0).toUpperCase() + key.slice(1);

    const renderKey = (keyString: string, id: string) => {
        if (revealedKeys.has(id)) return keyString;
        return keyString.substring(0, 4) + "•".repeat(24) + keyString.slice(-4);
    };

    const handleDisconnectBilling = async (providerId: string) => {
        if (!activeProjectId) return;
        setSavingBilling(true);
        try {
            const payload = {
                ...gatewayKeyInputs,
                [providerId]: null // nullify the key
            };

            // map local names to db fields
            const dbPayload = {
                stripeKey: payload.stripe,
                dodoWebhookUrl: payload.dodo,
                paddleKey: payload.paddle,
                razorpayKey: payload.razorpay,
            }

            const res = await fetch(`/api/projects/${activeProjectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dbPayload),
            });
            if (res.ok) {
                setGatewayKeyInputs(prev => ({ ...prev, [providerId]: "" }));
                toast.success(`${INTEGRATION_PROVIDERS.find(p => p.id === providerId)?.name} disconnected.`);
            } else {
                toast.error("Failed to disconnect");
            }
        } catch (e) {
            toast.error("Error disconnecting provider");
        } finally {
            setSavingBilling(false);
        }
    }

    const selectedProviderObj = INTEGRATION_PROVIDERS.find(p => p.id === selectedGatewayId)!;
    const isConnected = !!gatewayKeyInputs[selectedGatewayId];

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-syne flex items-center gap-3 text-foreground tracking-tight">
                        Integrations Hub
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">
                        Connect your billing systems or generate raw API keys for custom backend tracking. We instantly begin building intelligence around your customer behavior.
                    </p>
                </div>
            </div>

            {/* Premium Tab Selector */}
            <div className="inline-flex items-center p-1 bg-muted/40 border border-white/5 rounded-xl shadow-inner backdrop-blur-md">
                <button
                    onClick={() => setActiveSection("billing")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeSection === "billing" ? "bg-white text-black shadow-lg shadow-black/10 scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:bg-white/5"}`}
                >
                    Payment Gateways
                </button>
                <button
                    onClick={() => setActiveSection("api")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeSection === "api" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:bg-white/5"}`}
                >
                    Developer API Keys
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeSection === "billing" && (
                    <motion.div
                        key="billing"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden bg-background/50">
                            {/* Decorative background glow matching the provider */}
                            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-700 ${selectedProviderObj.bg.replace('/10', '')}`} />

                            <div className="max-w-2xl relative z-10">
                                <h2 className="text-xl font-bold text-foreground mb-6">Select Billing Provider</h2>

                                <div className="relative mb-8 group">
                                    <select
                                        value={selectedGatewayId}
                                        onChange={(e) => setSelectedGatewayId(e.target.value)}
                                        className="w-full appearance-none bg-muted/40 border-2 border-white/10 hover:border-white/20 rounded-xl px-4 py-4 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
                                    >
                                        {INTEGRATION_PROVIDERS.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-transform group-hover:translate-y-[-40%]">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        {/* We hide the select text visually and overlay our own beautifully styled active item if we wanted to be super fancy, but for native selects, let's keep it simple. Actually, we'll keep the native select text visible but add padding. */}
                                    </div>
                                </div>

                                <div className="space-y-5 bg-card/40 border border-white/5 p-6 rounded-xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-inner ${selectedProviderObj.bg}`}>
                                            <selectedProviderObj.icon className={`w-6 h-6 ${selectedProviderObj.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-foreground">{selectedProviderObj.name} Integration</h3>
                                                {isConnected && (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Connected
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{selectedProviderObj.desc}</p>
                                        </div>
                                    </div>

                                    {!isConnected ? (
                                        <>
                                            {selectedGatewayId === "razorpay" ? (
                                                <div
                                                    className={`space-y-3 relative p-4 rounded-xl transition-all duration-300 border-2 border-dashed ${isDraggingFile ? "bg-blue-500/10 border-blue-500/50 scale-[1.02]" : "bg-transparent border-transparent"}`}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                >
                                                    {isDraggingFile && (
                                                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl border border-blue-500/20 text-blue-400">
                                                            <UploadCloud className="w-8 h-8 mb-2 animate-bounce" />
                                                            <span className="font-bold text-sm tracking-tight">Drop API Key CSV to Auto-Fill</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                            <Key className="w-4 h-4 text-blue-400" /> Credentials
                                                        </h4>
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/5">Auto-Fill Supported</span>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                                            Razorpay Key ID
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            placeholder="rzp_live_..."
                                                            className="bg-background/80 border-white/10 font-mono text-sm h-11 focus:border-indigo-500"
                                                            value={gatewayKeyInputs.razorpayId || ""}
                                                            onChange={(e) => setGatewayKeyInputs(prev => ({ ...prev, razorpayId: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                                            Razorpay Key Secret
                                                        </label>
                                                        <Input
                                                            type="password"
                                                            placeholder="Secret Key"
                                                            className="bg-background/80 border-white/10 font-mono text-sm h-11 focus:border-indigo-500"
                                                            value={gatewayKeyInputs.razorpaySecret || ""}
                                                            onChange={(e) => setGatewayKeyInputs(prev => ({ ...prev, razorpaySecret: e.target.value }))}
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5 opacity-70" /> You can drag & drop the Key CSV file downloaded from Razorpay.
                                                    </p>
                                                    <div className="pt-2">
                                                        <label className="cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors bg-white/5 hover:bg-white/10 text-foreground border border-white/10">
                                                            <UploadCloud className="w-4 h-4 mr-2" />
                                                            Upload CSV File
                                                            <input 
                                                                type="file" 
                                                                accept=".csv,.txt" 
                                                                className="hidden" 
                                                                onChange={handleFileUpload}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                                        {selectedProviderObj.name} Live Secret Key
                                                    </label>
                                                    <Input
                                                        type="password"
                                                        placeholder={`sk_live_...`}
                                                        className="bg-background/80 border-white/10 font-mono text-sm h-11 focus:border-indigo-500"
                                                        value={gatewayKeyInputs[selectedGatewayId] || ""}
                                                        onChange={(e) => setGatewayKeyInputs(prev => ({ ...prev, [selectedGatewayId]: e.target.value }))}
                                                    />
                                                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5 opacity-70" /> Keys are AES-256 encrypted at rest. We only request read access.
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                onClick={handleSaveBilling}
                                                disabled={savingBilling || (selectedGatewayId === "razorpay" ? (!gatewayKeyInputs.razorpayId?.trim() || !gatewayKeyInputs.razorpaySecret?.trim()) : !gatewayKeyInputs[selectedGatewayId]?.trim())}
                                                className="w-full h-11 bg-white text-black hover:bg-gray-200 mt-2 font-semibold shadow-xl shadow-white/5 transition-all"
                                            >
                                                {savingBilling ? "Securely saving..." : `Connect ${selectedProviderObj.name}`}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="pt-2 border-t border-white/5 mt-4">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Churnova is actively syncing data from {selectedProviderObj.name}. Revenue metrics will appear automatically on the dashboard.
                                            </p>
                                            <Button
                                                onClick={() => handleDisconnectBilling(selectedGatewayId)}
                                                disabled={savingBilling}
                                                variant="outline"
                                                className="w-full h-11 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all font-semibold"
                                            >
                                                Disconnect Integration
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === "api" && (
                    <motion.div
                        key="api"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        {isLoadingKeys ? (
                            <div className="flex items-center justify-center p-24 text-muted-foreground">
                                <RefreshCw className="w-6 h-6 animate-spin" />
                            </div>
                        ) : apiKeys.length === 0 ? (
                            <div className="glass-card rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                                <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 shadow-inner border border-indigo-500/20">
                                    <Key className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">No API Key Generated</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm leading-relaxed">
                                    To send programmatic telemetry to Churnova directly from your Node.js, Python, or Go servers, you must generate a secure API key first.
                                </p>
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-indigo-500 hover:bg-indigo-600 border-0 text-white shadow-xl shadow-indigo-500/20 h-12 px-8 font-semibold text-sm transition-transform hover:scale-105"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Generate Your First API Key
                                </Button>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-5 gap-6">
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden bg-background/50">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2 text-foreground text-lg tracking-tight">
                                                    Developer API Keys
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">Manage keys for your production servers.</p>
                                            </div>
                                            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="h-9 gap-1.5 bg-indigo-500 text-white hover:bg-indigo-600 shadow-md">
                                                <Plus className="w-4 h-4" /> Create New Key
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {apiKeys.map((k) => (
                                                <div key={k.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-white/5 bg-card/60 hover:bg-card/80 transition-all shadow-sm group">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm font-bold text-foreground">{k.name}</span>
                                                            <span className="text-[10px] font-semibold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                                                {new Date(k.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-sm font-mono text-muted-foreground bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 break-all select-all">
                                                                {renderKey(k.key, k.id)}
                                                            </code>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <Button variant="outline" size="icon" className="h-9 w-9 border-white/10 hover:bg-white/10" onClick={() => toggleReveal(k.id)} title={revealedKeys.has(k.id) ? "Hide Key" : "Reveal Key"}>
                                                            {revealedKeys.has(k.id) ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="h-9 w-9 border-white/10 hover:bg-white/10 hover:text-white" onClick={() => handleCopy(k.id, k.key)} title="Copy Key">
                                                            {copiedKeyId === k.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="h-9 w-9 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-muted-foreground" onClick={() => handleDeleteKey(k.id)} title="Revoke Key">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Developer Docs Snippet */}
                                <div className="lg:col-span-2">
                                    <div className="bg-[#0D1117] rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-full flex flex-col">
                                        <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Code2 className="w-4 h-4 text-indigo-400" /> API Documentation</h3>
                                        </div>
                                        <div className="flex border-b border-white/5 bg-[#0D1117] overflow-x-auto">
                                            {Object.keys(snippets).map(k => (
                                                <button
                                                    key={k}
                                                    onClick={() => setActiveTab(k)}
                                                    className={`px-5 py-3 text-xs font-mono transition-colors whitespace-nowrap ${activeTab === k ? 'text-indigo-400 border-b-2 border-indigo-500 bg-[#161B22]' : 'text-muted-foreground hover:text-gray-300'}`}
                                                >
                                                    {getTabName(k)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22]">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-white hover:bg-white/10" onClick={() => { navigator.clipboard.writeText(snippets[activeTab as keyof typeof snippets]); toast.success("Copied to clipboard"); }}>
                                                <Copy className="w-3 h-3 mr-1.5" /> Copy
                                            </Button>
                                        </div>
                                        <div className="p-5 overflow-x-auto text-[13px] bg-[#0D1117] flex-1">
                                            <pre className="font-mono text-gray-300 leading-relaxed">
                                                <code>{snippets[activeTab as keyof typeof snippets]}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md border-white/10 bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Generate New API Key</DialogTitle>
                        <DialogDescription>
                            Create a new API key to authenticate your server-side requests securely.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">Key Name</label>
                        <Input
                            placeholder="e.g. Production Server, Node Data Generator"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            disabled={isCreatingKey}
                            className="bg-background/50 border-white/10 text-sm h-11"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateKey();
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} disabled={isCreatingKey} className="hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateKey} disabled={isCreatingKey || !newKeyName.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 shadow-lg px-6">
                            {isCreatingKey ? "Generating..." : "Generate Key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
