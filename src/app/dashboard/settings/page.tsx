"use client";

import { motion } from "framer-motion";
import {
  Key, Mail, Zap, Check, ChevronRight, Settings, Bell, Shield, Database
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "model", label: "AI Model", icon: Zap },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { anomalySensitivity, setAnomalySensitivity, activeProjectId, setActiveProjectId, projects, setProjects } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    slackWebhookUrl: "",
    alertEmail: "",
    alertsEnabled: true,
  });

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      const activeProject = projects.find(p => p.id === activeProjectId);
      if (activeProject) {
        setSettings({
          name: activeProject.name || "",
          slackWebhookUrl: (activeProject as any).slackWebhookUrl || "",
          alertEmail: (activeProject as any).alertEmail || "",
          alertsEnabled: (activeProject as any).alertsEnabled !== false,
        });
      }
      fetchApiKeys();
    }
  }, [activeProjectId, projects]);

  const fetchApiKeys = async () => {
    if (!activeProjectId) return;
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/keys`);
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys);
      }
    } catch (e) {
      console.error("Failed to fetch API keys", e);
    }
  };

  const handleCreateApiKey = async () => {
    if (!activeProjectId || !newKeyName) return;
    setCreatingKey(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      if (res.ok) {
        toast.success("API Key generated successfully");
        setNewKeyName("");
        setIsKeyModalOpen(false);
        fetchApiKeys();
      } else {
        toast.error("Failed to generate API Key");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!activeProjectId) return;
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/keys`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });
      if (res.ok) {
        toast.success("API Key revoked");
        fetchApiKeys();
      } else {
        toast.error("Failed to revoke API Key");
      }
    } catch (err) {
      toast.error("Error revoking API Key");
    }
  };

  const handleSave = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to update settings");
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTestSlack = async () => {
    if (!activeProjectId || !settings.slackWebhookUrl) {
      toast.error("Please enter and save a Slack Webhook URL first");
      return;
    }
    const loadingToast = toast.loading("Sending test alert...");
    try {
      const res = await fetch("/api/alerts/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProjectId, message: "🚨 *Test Alert from Churnova AI*\nThis is a test notification to confirm your Slack integration is working perfectly! 🚀" }),
      });
      if (res.ok) {
        toast.success("Test alert sent successfully!", { id: loadingToast });
      } else {
        throw new Error("Failed to send");
      }
    } catch (e) {
      toast.error("Failed to send test alert. Check your webhook URL.", { id: loadingToast });
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProjectId || !activeProject) return;
    if (deleteConfirmName !== activeProject.name) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete company");

      toast.success("Company deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteConfirmName("");

      const newProjects = projects.filter(p => p.id !== activeProjectId);
      setProjects(newProjects);
      setActiveProjectId(newProjects.length > 0 ? newProjects[0].id : null);

      if (newProjects.length === 0) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting company");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your Churnova AI workspace
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === tab.id
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl border border-white/8 p-5 space-y-4">
                  <h3 className="font-semibold text-sm">Workspace Settings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Company Name</label>
                      <Input
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="h-9 text-sm bg-muted/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Industry</label>
                      <Input defaultValue="B2B SaaS" className="h-9 text-sm bg-muted/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Alert Recipient Email</label>
                      <Input
                        value={settings.alertEmail}
                        onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                        placeholder="alerts@acmecorp.com"
                        className="h-9 text-sm bg-muted/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Timezone</label>
                      <Input defaultValue="America/New_York (UTC-5)" className="h-9 text-sm bg-muted/50" />
                    </div>
                  </div>
                </div>



                <div className="glass-card rounded-2xl border border-white/8 p-5">
                  <h3 className="font-semibold text-sm mb-4">Integrations</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Slack", desc: "Send alerts to Slack channels", status: "Connected" },
                      { name: "HubSpot", desc: "Sync high-risk users to CRM", status: "Not Connected" },
                      { name: "Salesforce", desc: "Push churn risk to accounts", status: "Not Connected" },
                      { name: "Intercom", desc: "Trigger in-app messages", status: "Connected" },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <Database className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">{integration.desc}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={integration.status === "Connected" ? "outline" : "ghost"}
                          className={`text-xs h-7 ${integration.status === "Connected" ? "text-green-400 border-green-500/30" : ""}`}
                          onClick={() => toast.info(`${integration.name} integration coming soon`)}
                        >
                          {integration.status === "Connected" ? (
                            <><Check className="w-3 h-3 mr-1" /> Connected</>
                          ) : (
                            <>Connect <ChevronRight className="w-3 h-3 ml-1" /></>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-red-500/20 p-5 mt-8">
                  <h3 className="font-semibold text-sm text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Deleting a company is irreversible. It will permanently remove all associated customers, telemetry events, API keys, and configurations.
                  </p>
                  <Button
                    variant="destructive"
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete Company
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl border border-white/8 p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-sm">Smart Alerts</h3>
                      <p className="text-xs text-muted-foreground">Master toggle for all outbound notifications</p>
                    </div>
                    <Switch
                      checked={settings.alertsEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, alertsEnabled: checked })}
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Database className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slack Integration</h4>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://hooks.slack.com/services/..."
                          value={settings.slackWebhookUrl}
                          onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
                          className="h-10 text-sm bg-muted/50 flex-1"
                        />
                        <Button
                          variant="outline"
                          className="h-10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                          onClick={handleTestSlack}
                        >
                          Test Alert
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Create an Incoming Webhook in your Slack Workspace to receive real-time churn alerts.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Notifications</h4>
                      </div>
                      <Input
                        placeholder="alerts@yourcompany.com"
                        value={settings.alertEmail}
                        onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                        className="h-10 text-sm bg-muted/50 px-3"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        A digest will be sent when customers cross the risk threshold (Health {"<"} 30).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-sm mb-4">Advanced Configuration</h3>
                  <div className="space-y-4">
                    {[
                      { key: "weeklyDigest", label: "Weekly Digest Email", desc: "Send weekly risk summary every Monday" },
                      { key: "anomalySpikes", label: "Anomaly Spikes", desc: "Alert on sudden anomaly score increases" },
                      { key: "revenueThreshold", label: "Revenue Threshold Alert", desc: "Alert when revenue at risk exceeds $10K" },
                    ].map((alert) => (
                      <div key={alert.key} className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm font-medium">{alert.label}</p>
                          <p className="text-xs text-muted-foreground">{alert.desc}</p>
                        </div>
                        <Switch
                          defaultChecked={alert.key === "weeklyDigest"}
                          onCheckedChange={(val) => toast.info(`${alert.label} ${val ? "enabled" : "disabled"}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "model" && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl border border-white/8 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-semibold text-sm">ML Model Configuration</h3>
                    <Badge className="ml-auto text-xs bg-green-500/10 text-green-400 border-green-500/20">
                      v2.4.1 Active
                    </Badge>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Anomaly Sensitivity</span>
                        <span className="text-indigo-400 font-bold">{anomalySensitivity}%</span>
                      </div>
                      <Slider
                        value={[anomalySensitivity]}
                        min={10}
                        max={90}
                        step={5}
                        onValueChange={([v]) => setAnomalySensitivity(v)}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Fewer alerts</span>
                        <span>More alerts</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        { label: "Anomaly Weight", value: "0.50", desc: "Isolation Forest" },
                        { label: "Trend Weight", value: "0.30", desc: "Linear Regression" },
                        { label: "Recency Weight", value: "0.20", desc: "Decay Score" },
                      ].map((w) => (
                        <div key={w.label} className="glass-card rounded-xl border border-white/8 p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">{w.label}</p>
                          <p className="text-xl font-bold gradient-text">{w.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{w.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Auto-Retrain Schedule</p>
                      <div className="flex gap-2">
                        {["Daily", "Weekly", "Monthly"].map(opt => (
                          <button
                            key={opt}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${opt === "Weekly" ? "gradient-bg text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl border border-white/8 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-semibold text-sm">API Keys</h3>
                  </div>
                  <div className="space-y-3">
                    {apiKeys.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No API Keys created yet.</p>
                    ) : (
                      apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                          <div>
                            <p className="text-sm font-medium">{apiKey.name}</p>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">{apiKey.key}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Created {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                            <Button size="sm" variant="outline" className="text-xs h-7 hover:bg-red-500/10 hover:text-red-500" onClick={() => handleRevokeKey(apiKey.id)}>Revoke</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="mt-4 gradient-bg text-white border-0 text-xs h-8 gap-2"
                    onClick={() => setIsKeyModalOpen(true)}
                  >
                    <Key className="w-3 h-3" />
                    Generate New Key
                  </Button>
                </div>

                <div className="glass-card rounded-2xl border border-white/8 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-400" />
                    <h3 className="font-semibold text-sm">Security Status</h3>
                    <Badge className="ml-auto text-xs bg-green-500/10 text-green-400 border-green-500/20">
                      <Check className="w-3 h-3 mr-1" /> Secure
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Two-Factor Authentication", status: true },
                      { label: "SSO via Clerk", status: true },
                      { label: "Data Encryption (AES-256)", status: true },
                      { label: "GDPR Compliance Mode", status: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1.5">
                        <p className="text-sm">{item.label}</p>
                        <Switch defaultChecked={item.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                className="gradient-bg text-white border-0 h-9 px-6 text-sm"
                onClick={handleSave}
                disabled={!mounted || loading || !activeProjectId}
              >
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Company Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Company</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the <strong>{activeProject?.name}</strong> company and remove all its data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm">Please type <strong className="select-all">{activeProject?.name}</strong> to confirm.</p>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={activeProject?.name}
              className="bg-muted/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmName(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting || deleteConfirmName !== activeProject?.name}
            >
              {isDeleting ? "Deleting..." : "Delete Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Key Modal */}
      <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new API Key</DialogTitle>
            <DialogDescription>
              Give this key a recognizable name to track its usage. This key will be bound to your active project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="keyName" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="keyName"
                placeholder="e.g. Production Backend"
                className="col-span-3 text-sm bg-muted/50"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="gradient-bg text-white border-0"
              onClick={handleCreateApiKey}
              disabled={creatingKey || !newKeyName}
            >
              {creatingKey ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
