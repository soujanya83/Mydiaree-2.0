import { create } from "zustand";
import { parentDashboardService } from "@/services/parent/parentDashboardService";

const SELECTED_CHILD_STORAGE_KEY = "mydiaree:parent-dashboard-child";

function loadSelectedChildId() {
  if (typeof window === "undefined") return "all";
  try {
    return localStorage.getItem(SELECTED_CHILD_STORAGE_KEY) || "all";
  } catch {
    return "all";
  }
}

function persistSelectedChildId(value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, value);
  } catch {}
}

export const useParentDashboardStore = create((set, get) => ({
  children: [],
  selectedChildId: loadSelectedChildId(),
  isLoadingChildren: false,
  lastLoadedCentreId: null,

  setChildren: (children = []) => {
    const nextChildren = Array.isArray(children) ? children : [];
    const { selectedChildId } = get();
    const isValidSelection =
      selectedChildId === "all" ||
      nextChildren.some((child) => String(child.id) === String(selectedChildId));

    const nextSelectedChildId = isValidSelection ? selectedChildId : "all";
    if (nextSelectedChildId !== selectedChildId) {
      persistSelectedChildId(nextSelectedChildId);
    }

    set({
      children: nextChildren,
      selectedChildId: nextSelectedChildId,
    });
  },

  setSelectedChildId: (selectedChildId) => {
    const nextValue = selectedChildId || "all";
    persistSelectedChildId(nextValue);
    set({ selectedChildId: nextValue });
  },

  fetchChildren: async (centerId, force = false) => {
    if (!centerId) return;

    const { lastLoadedCentreId, isLoadingChildren } = get();
    if (!force && String(lastLoadedCentreId) === String(centerId) && !isLoadingChildren) {
      return;
    }
    if (isLoadingChildren) return;

    set({ isLoadingChildren: true });
    try {
      const res = await parentDashboardService.getDashboard(centerId);
      if (res.status) {
        const nextChildren = res.data?.children || [];
        const { selectedChildId } = get();
        const isValidSelection =
          selectedChildId === "all" ||
          nextChildren.some((child) => String(child.id) === String(selectedChildId));

        const nextSelectedChildId = isValidSelection ? selectedChildId : "all";
        if (nextSelectedChildId !== selectedChildId) {
          persistSelectedChildId(nextSelectedChildId);
        }

        set({
          children: nextChildren,
          selectedChildId: nextSelectedChildId,
          lastLoadedCentreId: centerId,
          isLoadingChildren: false,
        });
      } else {
        set({ isLoadingChildren: false });
      }
    } catch (error) {
      console.error("Failed to fetch parent dashboard children:", error);
      set({ isLoadingChildren: false });
    }
  },

  reset: () => {
    persistSelectedChildId("all");
    set({
      children: [],
      selectedChildId: "all",
      isLoadingChildren: false,
      lastLoadedCentreId: null,
    });
  },
}));
