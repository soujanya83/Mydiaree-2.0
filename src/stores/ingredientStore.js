import { create } from "zustand";
import { ingredientService } from "@/services/nutrition/ingredientService";
import { ingredientTypeService } from "@/services/nutrition/ingredientTypeService";

export const useIngredientStore = create((set, get) => ({
  ingredientTypes: [],
  ingredients: [],
  isLoading: false,
  error: null,

  fetchIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const types = await ingredientService.getIngredients();
      set({ ingredientTypes: types, ingredients: types, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch ingredients",
      });
    }
  },

  fetchIngredientsForRecipe: async () => {
    set({ isLoading: true, error: null });
    try {
      const ingredients = await ingredientService.getIngredientsForRecipe();
      set({ ingredients, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch ingredients",
      });
    }
  },

  addIngredient: async (name, ingredientTypeId) => {
    set({ isLoading: true, error: null });
    try {
      const newIngredient = await ingredientService.createIngredient(name, ingredientTypeId);
      await get().fetchIngredients();
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
      await get().fetchIngredients();
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
      await get().fetchIngredients();
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to delete ingredient",
      });
      throw error;
    }
  },

  moveIngredientType: async (ingredientId, ingredientTypeId) => {
    set({ isLoading: true, error: null });
    try {
      await ingredientService.moveIngredientType(ingredientId, ingredientTypeId);
      await get().fetchIngredients();
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to move ingredient",
      });
      throw error;
    }
  },

  // Type management methods
  addType: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const newType = await ingredientTypeService.createType(name);
      await get().fetchIngredients();
      return newType;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to add type",
      });
      throw error;
    }
  },

  updateType: async (id, name) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await ingredientTypeService.updateType(id, name);
      await get().fetchIngredients();
      return updated;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to update type",
      });
      throw error;
    }
  },

  deleteType: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ingredientTypeService.deleteType(id);
      await get().fetchIngredients();
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to delete type",
      });
      throw error;
    }
  },
}));
