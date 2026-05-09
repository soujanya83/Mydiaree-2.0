import { create } from "zustand";
import { childrenService } from "@/services/centre/childrenService";

export const useChildrenStore = create((set, get) => ({
  children: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchChildren: async (filters) => {
    if (!filters.center_id) return;
    set({ isLoading: true, error: null });
    try {
      const response = await childrenService.filterChildren(filters);
      if (response.status) {
        set({
          children: response.data || [],
          summary: response.summary || null,
          isLoading: false,
        });
      } else {
        set({ children: [], isLoading: false, error: "Failed to fetch children" });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || "Something went wrong",
      });
    }
  },

  addChild: async (data, currentFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await childrenService.createChild(data);
      if (response.status) {
        await get().fetchChildren(currentFilters);
        return response;
      }
      throw new Error(response.message || "Failed to add child");
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updateChild: async (data, currentFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await childrenService.updateChild(data);
      if (response.status) {
        await get().fetchChildren(currentFilters);
        return response;
      }
      throw new Error(response.message || "Failed to update child");
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteChildren: async (childIds, currentFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await childrenService.deleteChildren(childIds);
      if (response.status) {
        await get().fetchChildren(currentFilters);
        return response;
      }
      throw new Error(response.message || "Failed to delete children");
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
