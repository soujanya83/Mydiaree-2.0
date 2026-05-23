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
  lastLoadedParentId: null,

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

  // Called when the parent picks a different child in the dropdown.
  // Optimistically updates the store then persists to the server.
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
      // Roll back on failure
      persistSelectedChildId(previousValue);
      set({ selectedChildId: previousValue });
      console.error("Failed to save selected child:", error);
    } finally {
      set({ isSavingSelectedChild: false });
    }
  },

  // Called once after login (from AppLayout).
  // 1. GET /global-parent-children/{parentId}  — full children list for the dropdown
  // 2. GET /parent-dashboard/selected-child    — server-persisted selected child
  fetchChildren: async (parentId, force = false) => {
    if (!parentId) return;

    const { lastLoadedParentId, isLoadingChildren, selectedChildId } = get();
    // Only skip if already successfully loaded for this exact parentId
    if (!force && lastLoadedParentId && String(lastLoadedParentId) === String(parentId)) {
      return;
    }
    if (isLoadingChildren) return;

    set({ isLoadingChildren: true });
    try {
      const [childrenRes, selectedChildRes] = await Promise.all([
        parentDashboardService.getParentChildren(parentId),
        parentDashboardService.getSelectedChild(),
      ]);

      if (childrenRes.status) {
        const nextChildren = childrenRes.children || [];

        // Prefer the server-persisted selected child, fall back to localStorage / first child
        const serverSelectedId = selectedChildRes?.status
          ? normalizeChildId(selectedChildRes?.data?.selectedchildreanid)
          : "";

        const nextSelectedChildId = resolveSelectedChildId(
          nextChildren,
          serverSelectedId || selectedChildId,
        );

        persistSelectedChildId(nextSelectedChildId);
        set({
          children: nextChildren,
          selectedChildId: nextSelectedChildId,
          lastLoadedParentId: parentId,
          isLoadingChildren: false,
        });
      } else {
        set({ isLoadingChildren: false });
      }
    } catch (error) {
      console.error("Failed to fetch parent children:", error);
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
      lastLoadedParentId: null,
    });
  },
}));
