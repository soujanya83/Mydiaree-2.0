import { create } from "zustand";
import { menuService } from "@/services/nutrition/menuService";

export const useMenuStore = create((set, get) => ({
  menuData: [], // Flat list of menu items from API
  isLoading: false,
  error: null,

  fetchMenu: async (centerId, selectedDate) => {
    if (!centerId || !selectedDate) return;
    set({ isLoading: true, error: null });
    try {
      const data = await menuService.getMenu(centerId, selectedDate);
      set({
        menuData: data.menus || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch menu",
      });
    }
  },

  addRecipes: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await menuService.addRecipesToMenu(payload);
      // Re-fetch to refresh the view
      await get().fetchMenu(payload.centerId, payload.selectedDate);
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to add recipes",
      });
      throw error;
    }
  },

  deleteMenuItem: async (id, centerId, selectedDate) => {
    set({ isLoading: true, error: null });
    try {
      await menuService.deleteMenu(id);
      await get().fetchMenu(centerId, selectedDate);
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to delete menu item",
      });
      throw error;
    }
  },
}));
