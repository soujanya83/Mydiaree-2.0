import { create } from "zustand";
import { childrenService } from "@/services/centre/childrenService";

export const useChildrenStore = create((set, get) => ({
  children: [],
  summary: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  error: null,

  fetchChildren: async (filters) => {
    if (!filters.center_id) return;
    set({ isLoading: true, error: null });
    try {
      const response = await childrenService.filterChildren(filters);
      if (response.status) {
        set({
          children: response.data?.data || (Array.isArray(response.data) ? response.data : []),
          summary: response.summary || null,
          pagination: response.pagination || {
            current_page: response.data?.current_page || 1,
            last_page: response.data?.last_page || 1,
            total: response.data?.total || 0,
            per_page: response.data?.per_page || 10,
          },
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
      const err = new Error(response.message || "Failed to add child");
      err.errors = response.errors;
      throw err;
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
      const err = new Error(response.message || "Failed to update child");
      err.errors = response.errors;
      throw err;
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
