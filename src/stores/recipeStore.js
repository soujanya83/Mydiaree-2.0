import { create } from "zustand";
import { recipeService } from "@/services/nutrition/recipeService";

export const useRecipeStore = create((set, get) => ({
  recipesGrouped: {},
  mealTypes: [],
  isLoading: false,
  error: null,

  fetchRecipes: async (centerId) => {
    if (!centerId) return;
    set({ isLoading: true, error: null });
    try {
      const data = await recipeService.getRecipes(centerId);
      set({
        recipesGrouped: data.recipes || {},
        mealTypes: data.unique_meal_types || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch recipes",
      });
    }
  },

  addRecipe: async (recipeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await recipeService.createRecipe(recipeData);
      // Re-fetch to get the updated grouped list with all data
      if (recipeData.centerId) {
        await get().fetchRecipes(recipeData.centerId);
      }
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to add recipe",
      });
      throw error;
    }
  },

  updateRecipe: async (recipeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await recipeService.updateRecipe(recipeData);
      // Re-fetch to get updated state
      if (recipeData.centerId) {
        await get().fetchRecipes(recipeData.centerId);
      } else {
        // Fallback if centerId not passed in data
        // For simplicity, re-fetching is safer than complex local state update for grouped data
      }
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to update recipe",
      });
      throw error;
    }
  },

  deleteRecipe: async (id, centerId) => {
    set({ isLoading: true, error: null });
    try {
      await recipeService.deleteRecipe(id);
      if (centerId) {
        await get().fetchRecipes(centerId);
      }
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to delete recipe",
      });
      throw error;
    }
  },
}));
