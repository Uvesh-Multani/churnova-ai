import { create } from "zustand";
import { UserRecord, sampleUsers } from "@/lib/data";

interface AppState {
  users: UserRecord[];
  selectedUser: UserRecord | null;
  sidebarCollapsed: boolean;
  anomalySensitivity: number;
  isAnalyzing: boolean;
  analysisProgress: number;
  
  setSelectedUser: (user: UserRecord | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAnomalySensitivity: (value: number) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisProgress: (value: number) => void;
  runAnalysis: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: sampleUsers,
  selectedUser: null,
  sidebarCollapsed: false,
  anomalySensitivity: 50,
  isAnalyzing: false,
  analysisProgress: 0,

  setSelectedUser: (user) => set({ selectedUser: user }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setAnomalySensitivity: (value) => set({ anomalySensitivity: value }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setAnalysisProgress: (value) => set({ analysisProgress: value }),

  runAnalysis: async () => {
    set({ isAnalyzing: true, analysisProgress: 0 });
    
    // Simulate ML analysis progress
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      set({ analysisProgress: progress });
    }
    
    set({ isAnalyzing: false, analysisProgress: 100 });
  },
}));
