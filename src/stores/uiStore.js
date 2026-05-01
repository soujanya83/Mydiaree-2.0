import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUiStore = create(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      expandedGroups: {
        "daily-operations": true,
        learning: true,
        centre: false,
        nutrition: false,
        compliance: false,
        admin: false,
      },
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleMobileSidebar: () => set({ mobileSidebarOpen: !get().mobileSidebarOpen }),
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
      toggleGroup: (key) =>
        set({
          expandedGroups: {
            ...get().expandedGroups,
            [key]: !get().expandedGroups[key],
          },
        }),
      setGroupOpen: (key, open) =>
        set({
          expandedGroups: { ...get().expandedGroups, [key]: open },
        }),
    }),
    { name: "mydiaree-ui" }
  )
);
