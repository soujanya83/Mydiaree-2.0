import { create } from "zustand";
import { ingredientService } from "@/services/nutrition/ingredientService";

export const useIngredientStore = create((set, get) => ({
  ingredients: [],
  isLoading: false,
  error: null,

  fetchIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const ingredients = await ingredientService.getIngredients();
      set({ ingredients, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch ingredients",
      });
    }
  },

  addIngredient: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const newIngredient = await ingredientService.createIngredient(name);
      set((state) => ({
        ingredients: [...state.ingredients, newIngredient],
        isLoading: false,
      }));
      return newIngredient;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to add ingredient",
      });
      throw error;
    }
  },

  updateIngredient: async (id, name) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await ingredientService.updateIngredient(id, name);
      set((state) => ({
        ingredients: state.ingredients.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to update ingredient",
      });
      throw error;
    }
  },

  deleteIngredient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ingredientService.deleteIngredient(id);
      set((state) => ({
        ingredients: state.ingredients.filter((item) => item.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to delete ingredient",
      });
      throw error;
    }
  },
}));
