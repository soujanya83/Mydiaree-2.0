import api from "../../api/api";

export const ingredientService = {
  // 1. List of all ingredients grouped by types
  getIngredients: async () => {
    try {
      const response = await api.get("/ingredients");
      if (response.data && response.data.status === "success") {
        return response.data.types || [];
      }
      throw new Error(response.data?.message || "Failed to fetch ingredients");
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      throw error;
    }
  },

  getIngredientsForRecipe: async () => {
    try {
      const response = await api.get("/ingredients/list");
      if (response.data && response.data.status === "success") {
        return response.data.ingredients || [];
      }
      throw new Error(response.data?.message || "Failed to fetch ingredients");
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      throw error;
    }
  },

  // 2. Create ingredient
  createIngredient: async (name, ingredientTypeId) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("ingredient_type_id", ingredientTypeId);
      const response = await api.post("/ingredient/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create ingredient");
    } catch (error) {
      console.error("Error creating ingredient:", error);
      throw error;
    }
  },

  // 3. Update ingredient
  updateIngredient: async (id, name) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", name);
      const response = await api.post("/ingredient/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to update ingredient");
    } catch (error) {
      console.error("Error updating ingredient:", error);
      throw error;
    }
  },

  // 4. Delete ingredient
  deleteIngredient: async (id) => {
    try {
      const response = await api.delete(`/ingredient/${id}`);
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete ingredient");
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      throw error;
    }
  },

  // 5. Move ingredient to different type
  moveIngredientType: async (ingredientId, ingredientTypeId) => {
    try {
      const formData = new FormData();
      formData.append("ingredient_id", ingredientId);
      formData.append("ingredient_type_id", ingredientTypeId);
      const response = await api.post("/ingredients/move-type", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to move ingredient");
    } catch (error) {
      console.error("Error moving ingredient type:", error);
      throw error;
    }
  },
};
