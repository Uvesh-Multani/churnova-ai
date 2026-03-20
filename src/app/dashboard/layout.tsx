"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, BarChart3, Bell, ChevronLeft, ChevronRight, LayoutDashboard,
  LineChart, Search, Settings, Shield, TrendingDown, Upload,
  Users, Users2, FileText, Zap, X, LogOut, User, ChevronDown, Code2, Check, Trash2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";

const navGroups = [
  {
    label: "Overview",
    items: [{ icon: LayoutDashboard, label: "Overview", href: "/dashboard" }],
  },
  {
    label: "Insights",
    items: [
      { icon: Users, label: "Users", href: "/dashboard/users" },
      { icon: Shield, label: "At-Risk Customers", href: "/dashboard/risk" },
      { icon: Zap, label: "AI Insights", href: "/dashboard/intelligence" },
    ],
  },
  {
    label: "Trends",
    items: [
      { icon: Users2, label: "Retention Tracking", href: "/dashboard/cohorts" },
      { icon: Activity, label: "Unusual Activity", href: "/dashboard/anomalies" },
      { icon: LineChart, label: "Usage Logs", href: "/dashboard/engagement" },
    ],
  },
  {
    label: "Integration",
    items: [
      { icon: Code2, label: "Integrations Hub", href: "/dashboard/connect" },
      { icon: Upload, label: "Import CSV", href: "/dashboard/upload" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: FileText, label: "Reports", href: "/dashboard/reports" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

export interface LiveActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
  timestamp?: string;
  isRead?: boolean;
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, projects, setProjects, activeProjectId, setActiveProjectId } = useAppStore();
  const activeProject = projects.find(p => p.id === activeProjectId);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);
  const [liveActivities, setLiveActivities] = useState<LiveActivityItem[]>([]);
  const hasUnread = liveActivities.some(a => !a.isRead);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

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

        // Set default project if none selected or the active one was deleted/unauthorized
        const validProjectIds = data.map((p: any) => p.id);
        if (data.length > 0 && (!activeProjectId || !validProjectIds.includes(activeProjectId))) {
          setActiveProjectId(data[0].id);
        }
      } catch (err) {
        console.error("Dashboard Auth/Project Error:", err);
      }
    };

    fetchProjects();
  }, [pathname, activeProjectId, router, setProjects, setActiveProjectId]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!activeProjectId) return;
      try {
        const res = await fetch(`/api/events/recent?projectId=${activeProjectId}`);
        if (res.ok) {
          const data = await res.json();
          
          // Apply local state for virtual alerts
          const readAlerts = JSON.parse(localStorage.getItem("churnova_read_alerts") || "[]");
          const deletedAlerts = JSON.parse(localStorage.getItem("churnova_deleted_alerts") || "[]");
          
          const filtered = data
            .filter((a: LiveActivityItem) => !deletedAlerts.includes(a.id))
            .map((a: LiveActivityItem) => ({
              ...a,
              isRead: a.id.startsWith("alert-") ? readAlerts.includes(a.id) : a.isRead
            }));
            
          setLiveActivities(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch live activity");
      }
    };

    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [activeProjectId]);

  const handleMarkAsRead = async (id: string) => {
    if (id.startsWith("alert-")) {
      const readAlerts = JSON.parse(localStorage.getItem("churnova_read_alerts") || "[]");
      if (!readAlerts.includes(id)) {
        readAlerts.push(id);
        localStorage.setItem("churnova_read_alerts", JSON.stringify(readAlerts));
      }
    } else {
      try {
        await fetch(`/api/events/notifications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
      } catch (err) {
        console.error("Failed to mark as read");
      }
    }
    setLiveActivities(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("alert-")) {
      const deletedAlerts = JSON.parse(localStorage.getItem("churnova_deleted_alerts") || "[]");
      if (!deletedAlerts.includes(id)) {
        deletedAlerts.push(id);
        localStorage.setItem("churnova_deleted_alerts", JSON.stringify(deletedAlerts));
      }
    } else {
      try {
        await fetch(`/api/events/notifications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDeleted: true }),
        });
      } catch (err) {
        console.error("Failed to delete notification");
      }
    }
    setLiveActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();
      setProjects([...projects, newProject]);
      setActiveProjectId(newProject.id);
      setIsCreateModalOpen(false);
      setNewProjectName("");
      toast.success("Company created successfully!");
    } catch (error) {
      toast.error("Failed to create company");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
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
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 6V14L8 10L2 14V6L8 2Z" fill="white" fillOpacity="0.9"/></svg>
              </div>
              {!sidebarCollapsed && (
                <span className="font-syne font-bold text-sm tracking-tight text-[var(--text-primary)]">
                  churnova<span className="text-[var(--accent-primary)]">.</span>
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
                onChange={(e) => {
                  if (e.target.value === "new") {
                    setIsCreateModalOpen(true);
                  } else {
                    setActiveProjectId(e.target.value);
                  }
                }}
                className="w-full bg-slate-50 border border-border rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer pr-8 hover:bg-slate-100 transition-colors"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="new">+ Add New Company</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ChevronDown size={12} />
              </div>
            </div>
          )}

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Enter the name of your new company to start tracking analytics.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g. Acme Corp"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  disabled={isCreating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateProject();
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()} className="gradient-bg text-white border-0">
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1 relative">
              {!sidebarCollapsed && group.label !== "Overview" && (
                <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative ${isActive
                        ? "bg-indigo-50/70 text-indigo-600 border-l-[3px] border-l-indigo-500 border border-indigo-100/60"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-indigo-50/50 rounded-xl"
                        />
                      )}
                      <item.icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${isActive ? "text-indigo-600" : ""}`} />
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
            </div>
          ))}
        </nav>

        {/* Live Activity Feed */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-muted-foreground">Live Activity</span>
              </div>
              <div className="space-y-2">
                {liveActivities.length > 0 ? (
                  liveActivities.slice(0, 3).map((activity, i) => (
                    <motion.div
                      key={activity.id || i}
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
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No recent activity.</p>
                )}
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
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-[var(--bg-warm)]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
              <Input
                placeholder="Search users, insights..."
                className="pl-9 pr-14 bg-muted/50 border-border h-9 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-medium text-muted-foreground/60 select-none pointer-events-none">
                <span className="text-[12px]">⌘</span>K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="hidden md:flex bg-indigo-50/60 border border-indigo-100/40 text-indigo-600 text-[10px] font-bold tracking-tight px-2.5 py-1 rounded-full items-center gap-1.5 animate-glow-pulse">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
              </span>
              AI ACTIVE
            </Badge>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <>
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
                        {liveActivities.length > 0 ? (
                          liveActivities.map((a, i) => (
                            <div 
                              key={a.id || i} 
                              className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer group border-b border-border/50 last:border-0 ${!a.isRead ? "bg-indigo-50/30" : ""}`}
                            >
                              <div className={`p-2 rounded-xl flex-shrink-0 ${
                                a.type === "high" 
                                  ? "bg-red-50 text-red-500" 
                                  : a.type === "medium" 
                                  ? "bg-yellow-50 text-yellow-600" 
                                  : "bg-indigo-50 text-indigo-500"
                              }`}>
                                {a.type === "high" ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : a.type === "medium" ? (
                                  <Activity className="w-4 h-4" />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${!a.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"} truncate`}>{a.user}</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{a.action}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-medium mt-1 uppercase tracking-wider">{a.time}</p>
                              </div>
                              <div className="flex flex-row gap-1.5 items-center ml-2">
                                {!a.isRead && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(a.id); }}
                                    className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors shadow-sm bg-background border border-border"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm bg-background border border-border"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {!a.isRead && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet.
                          </div>
                        )}
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


        </main>
      </div>
    </div>
  );
}


