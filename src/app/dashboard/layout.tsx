"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity, BarChart3, Bell, ChevronLeft, ChevronRight, LayoutDashboard,
  LineChart, Moon, Search, Settings, Shield, Sun, TrendingDown, Upload,
  Users, FileText, Zap, X, LogOut, User, ChevronDown
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          JD
        </div>
        <span className="text-sm font-medium hidden md:block">John Doe</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold">John Doe</p>
                <p className="text-xs text-muted-foreground">john@company.com</p>
                <Badge className="mt-1.5 text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Growth Plan</Badge>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </button>
                <div className="border-t border-border my-1" />
                <Link href="/">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-left">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar-background overflow-hidden z-20"
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-border ${sidebarCollapsed ? "justify-center" : "gap-2 justify-between"}`}>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-sm whitespace-nowrap"
                >
                  Churnova <span className="gradient-text">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative ${
                    isActive
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
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === "high" ? "bg-red-500" : activity.type === "medium" ? "bg-yellow-500" : "bg-green-500"
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
            <Badge className="hidden md:flex glass border border-indigo-500/30 text-indigo-400 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              AI Active
            </Badge>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              a.type === "high" ? "bg-red-500" : a.type === "medium" ? "bg-yellow-500" : "bg-green-500"
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

            <UserProfileDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
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
