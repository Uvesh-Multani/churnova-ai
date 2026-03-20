import { create } from "zustand";
import { UserRecord, sampleUsers } from "@/lib/data";

interface AppState {
  users: UserRecord[];
  selectedUser: UserRecord | null;
  sidebarCollapsed: boolean;
  anomalySensitivity: number;
  isAnalyzing: boolean;
  analysisProgress: number;
  projects: any[];
  activeProjectId: string | null;

  setSelectedUser: (user: UserRecord | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAnomalySensitivity: (value: number) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisProgress: (value: number) => void;
  setProjects: (projects: any[]) => void;
  setActiveProjectId: (id: string | null) => void;
  runAnalysis: () => Promise<void>;
  fetchUsers: (projectId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: sampleUsers,
  selectedUser: null,
  sidebarCollapsed: false,
  anomalySensitivity: 50,
  isAnalyzing: false,
  analysisProgress: 0,
  projects: [],
  activeProjectId: typeof window !== "undefined" ? localStorage.getItem("churnova_active_project") : null,

  setSelectedUser: (user) => set({ selectedUser: user }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setAnomalySensitivity: (value) => set({ anomalySensitivity: value }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setAnalysisProgress: (value) => set({ analysisProgress: value }),
  setProjects: (projects) => set({ projects }),
  setActiveProjectId: (id) => {
    set({ activeProjectId: id });
    if (id) {
      localStorage.setItem("churnova_active_project", id);
      get().fetchUsers(id);
    } else {
      localStorage.removeItem("churnova_active_project");
      set({ users: [] });
    }
  },

  fetchUsers: async (projectId: string) => {
    try {
      const res = await fetch(`/api/dashboard/customers?projectId=${projectId}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        set({ users: data.users || [] });
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  },

  runAnalysis: async () => {
    set({ isAnalyzing: true, analysisProgress: 10 });

    try {
      const res = await fetch('/api/dashboard/ml/retrain', { method: 'POST' });
      set({ analysisProgress: 60 });

      if (res.ok) {
        // Models retrained. Refetch users to get new predictions if any.
        const projectId = get().activeProjectId;
        if (projectId) {
          await get().fetchUsers(projectId);
        }
        set({ analysisProgress: 100 });
      } else {
        console.error("Retrain failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isAnalyzing: false });
      setTimeout(() => set({ analysisProgress: 0 }), 2000);
    }
  },
}));
