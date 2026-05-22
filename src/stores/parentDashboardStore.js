import { create } from "zustand";
import { parentDashboardService } from "@/services/parent/parentDashboardService";

const SELECTED_CHILD_STORAGE_KEY = "mydiaree:parent-dashboard-child";

function loadSelectedChildId() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(SELECTED_CHILD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function persistSelectedChildId(value) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(SELECTED_CHILD_STORAGE_KEY);
    }
  } catch {}
}

function normalizeChildId(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function resolveSelectedChildId(children = [], preferredId) {
  const nextChildren = Array.isArray(children) ? children : [];
  const normalizedPreferredId = normalizeChildId(preferredId);

  if (normalizedPreferredId) {
    const match = nextChildren.find((child) => String(child.id) === normalizedPreferredId);
    if (match) return normalizedPreferredId;
  }

  return nextChildren[0] ? String(nextChildren[0].id) : "";
}

export const useParentDashboardStore = create((set, get) => ({
  children: [],
  selectedChildId: loadSelectedChildId(),
  isLoadingChildren: false,
  isSavingSelectedChild: false,
  lastLoadedCentreId: null,

  setChildren: (children = [], preferredSelectedChildId) => {
    const nextChildren = Array.isArray(children) ? children : [];
    const currentSelectedChildId =
      preferredSelectedChildId !== undefined ? preferredSelectedChildId : get().selectedChildId;
    const nextSelectedChildId = resolveSelectedChildId(nextChildren, currentSelectedChildId);

    persistSelectedChildId(nextSelectedChildId);
    set({
      children: nextChildren,
      selectedChildId: nextSelectedChildId,
    });
  },

  setSelectedChildId: async (selectedChildId) => {
    const nextValue = normalizeChildId(selectedChildId);
    const { children, selectedChildId: previousValue } = get();

    if (!nextValue || !children.some((child) => String(child.id) === nextValue)) {
      return;
    }

    persistSelectedChildId(nextValue);
    set({ selectedChildId: nextValue, isSavingSelectedChild: true });

    try {
      const res = await parentDashboardService.saveSelectedChild(nextValue);
      if (!res.status) {
        throw new Error(res.message || "Failed to save selected child");
      }
    } catch (error) {
      persistSelectedChildId(previousValue);
      set({ selectedChildId: previousValue });
      console.error("Failed to save selected child:", error);
    } finally {
      set({ isSavingSelectedChild: false });
    }
  },

  fetchChildren: async (centerId, force = false) => {
    if (!centerId) return;

    const { lastLoadedCentreId, isLoadingChildren, selectedChildId } = get();
    if (!force && String(lastLoadedCentreId) === String(centerId) && !isLoadingChildren) {
      return;
    }
    if (isLoadingChildren) return;

    set({ isLoadingChildren: true });
    try {
      const [dashboardRes, selectedChildRes] = await Promise.all([
        parentDashboardService.getDashboard(centerId),
        parentDashboardService.getSelectedChild(),
      ]);

      if (dashboardRes.status) {
        const nextChildren = dashboardRes.data?.children || [];
        const apiSelectedChildId = selectedChildRes?.status
          ? selectedChildRes?.data?.selectedchildreanid
          : undefined;
        const nextSelectedChildId = resolveSelectedChildId(
          nextChildren,
          apiSelectedChildId || selectedChildId,
        );

        persistSelectedChildId(nextSelectedChildId);
        set({
          children: nextChildren,
          selectedChildId: nextSelectedChildId,
          lastLoadedCentreId: centerId,
          isLoadingChildren: false,
        });

        if (
          nextSelectedChildId &&
          normalizeChildId(apiSelectedChildId) !== normalizeChildId(nextSelectedChildId)
        ) {
          try {
            await parentDashboardService.saveSelectedChild(nextSelectedChildId);
          } catch (error) {
            console.error("Failed to sync selected child:", error);
          }
        }
      } else {
        set({ isLoadingChildren: false });
      }
    } catch (error) {
      console.error("Failed to fetch parent dashboard children:", error);
      set({ isLoadingChildren: false });
    }
  },

  reset: () => {
    persistSelectedChildId("");
    set({
      children: [],
      selectedChildId: "",
      isLoadingChildren: false,
      isSavingSelectedChild: false,
      lastLoadedCentreId: null,
    });
  },
}));
