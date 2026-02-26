"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity, BarChart3, Bell, ChevronLeft, ChevronRight, LayoutDashboard,
  LineChart, Moon, Search, Settings, Shield, Sun, TrendingDown, Upload,
  Users, FileText, Zap, X, LogOut, User, ChevronDown, RefreshCcw
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: Shield, label: "Risk Analysis", href: "/dashboard/risk" },
  { icon: Activity, label: "Anomaly Detection", href: "/dashboard/anomalies" },
  { icon: LineChart, label: "Engagement Trends", href: "/dashboard/engagement" },
  { icon: Upload, label: "Data Upload", href: "/dashboard/upload" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const liveActivity = [
  { user: "USR-0023", action: "Risk score increased to 78", time: "2s ago", type: "high" },
  { user: "USR-0847", action: "Login frequency dropped 40%", time: "18s ago", type: "medium" },
  { user: "USR-0156", action: "Anomaly detected in session data", time: "1m ago", type: "high" },
  { user: "USR-0392", action: "Engagement recovered to 85%", time: "3m ago", type: "low" },
  { user: "USR-0711", action: "30-day inactivity threshold reached", time: "5m ago", type: "high" },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, projects, setProjects, activeProjectId, setActiveProjectId } = useAppStore();
  const activeProject = projects.find(p => p.id === activeProjectId);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setProjects(data);

        // Redirect if no projects and not already onboarding
        if (data.length === 0 && pathname !== "/onboarding") {
          router.push("/onboarding");
          return;
        }

        // Set default project if none selected
        if (data.length > 0 && !activeProjectId) {
          setActiveProjectId(data[0].id);
        }
      } catch (err) {
        console.error("Dashboard Auth/Project Error:", err);
      }
    };

    fetchProjects();
  }, [pathname, activeProjectId, router, setProjects, setActiveProjectId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Suspense fallback={null}>
        <PaymentVerifier />
      </Suspense>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar-background overflow-hidden z-20"
      >
        {/* Logo & Project Switcher */}
        <div className={`px-4 py-4 border-b border-border flex flex-col gap-4 overflow-hidden`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2 justify-between"}`}>
            <Link href="/" className="flex items-center gap-1 group">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,197,66,0.2)] group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4 text-[var(--bg-base)]" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-syne font-bold text-sm tracking-tight text-[var(--text-primary)]">
                  CHURNOVA<span className="text-[var(--accent-primary)]">.</span>
                </span>
              )}
            </Link>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <ChevronLeft className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {!sidebarCollapsed && projects.length > 0 && (
            <div className="relative">
              <select
                value={activeProjectId || ""}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer pr-8 hover:bg-muted/50 transition-colors"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ChevronDown size={12} />
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative ${isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                    />
                  )}
                  <item.icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${isActive ? "text-indigo-400" : ""}`} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="text-sm font-medium whitespace-nowrap relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Live Activity Feed */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-3">
            <div className="rounded-xl bg-sidebar-accent/50 p-3 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-muted-foreground">Live Activity</span>
              </div>
              <div className="space-y-2">
                {liveActivity.slice(0, 3).map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${activity.type === "high" ? "bg-red-500" : activity.type === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                      <p className="text-xs truncate" style={{ fontSize: "10px" }}>{activity.action}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="flex justify-center pb-4">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users, insights..."
                className="pl-9 bg-muted/50 border-border h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeProject?.plan !== "FREE" ? (
              <Badge className="hidden md:flex bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs py-1">
                <Zap className="w-3 h-3 mr-1" />
                PRO Plan
              </Badge>
            ) : (
              <Badge className="hidden md:flex glass border border-indigo-500/30 text-indigo-400 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        <button onClick={() => setNotificationsOpen(false)}>
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="divide-y divide-border max-h-80 overflow-y-auto">
                        {liveActivity.map((a, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === "high" ? "bg-red-500" : a.type === "medium" ? "bg-yellow-500" : "bg-green-500"
                              }`} />
                            <div>
                              <p className="text-xs font-medium">{a.user}</p>
                              <p className="text-xs text-muted-foreground">{a.action}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 border border-border"
                }
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>

          {/* Subscription Gate Overlay */}
          {mounted && projects.find(p => p.id === activeProjectId)?.plan === "FREE" && pathname !== "/dashboard/upload" && pathname !== "/dashboard/settings" && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass p-8 border border-[var(--accent-primary)] shadow-[0_0_30px_rgba(245,197,66,0.1)] text-center"
              >
                <div className="w-16 h-16 bg-[var(--accent-glow)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-2xl font-syne font-bold mb-3">Upgrade Your Plan</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
                  You're currently on the Free plan. To access advanced churn heartbeats,
                  custom risk models, and full history, please upgrade your project.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full btn-primary h-12 text-sm font-bold"
                    onClick={() => router.push("/pricing")}
                  >
                    View Pricing & Upgrade
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs border-white/10 hover:bg-white/5"
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      btn.disabled = true;
                      btn.innerHTML = "Syncing...";
                      try {
                        const res = await fetch("/api/dodo/sync");
                        if (res.ok) {
                          window.location.reload();
                        }
                      } catch (err) {
                        console.error("Sync error:", err);
                      } finally {
                        btn.disabled = false;
                        btn.innerHTML = "Sync Plan Status";
                      }
                    }}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Sync Plan Status
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => router.push("/dashboard/upload")}
                  >
                    Continue with Limited Access
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PaymentVerifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setProjects } = useAppStore();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    let toastId: string | number | undefined;

    const interval = setInterval(async () => {
      try {
        if (!toastId) {
          toastId = toast.loading("Verifying your payment status...");
        }

        const verifyRes = await fetch(`/api/dodo/verify?session_id=${sessionId}`);
        if (!verifyRes.ok) return;
        const verifyData = await verifyRes.json();

        if (verifyData.plan === "PRO" || verifyData.plan === "BASIC") {
          toast.success(`Payment verified! Welcome to ${verifyData.plan}.`, { id: toastId });
          const res = await fetch("/api/projects");
          if (res.ok) {
            const data = await res.json();
            setProjects(data);
          }
          clearInterval(interval);
          // Remove session_id from URL
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          router.replace(url.pathname + url.search);
        } else if (verifyData.status === "failed") {
          toast.error("Payment failed. Please try again.", { id: toastId });
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (toastId) toast.dismiss(toastId);
    };
  }, [searchParams, router, setProjects]);

  return null;
}
