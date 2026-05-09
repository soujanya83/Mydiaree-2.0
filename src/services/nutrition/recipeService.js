import api from "../../api/api";

export const recipeService = {
  // 1. List of all recipes
  getRecipes: async (centerId) => {
    try {
      const response = await api.get("/healthy-recipes", {
        params: { center_id: centerId },
      });
      if (response.data && response.data.status === "success") {
        return response.data; // returns { recipes, unique_meal_types, ingredients, ... }
      }
      throw new Error(response.data?.message || "Failed to fetch recipes");
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  },

  // 2. Create recipe
  createRecipe: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "ingredients") {
          // For create, API expects 'ingredient' instead of 'ingredients[]'
          // We'll send them as separate 'ingredient' fields or the backend might expect comma-separated.
          // Based on user request 'it would be ingredient', we'll use singular key.
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append("ingredient", v));
          } else {
            formData.append("ingredient", value);
          }
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });


      const response = await api.post("/recipe/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to create recipe");
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  },

  // 3. Update recipe
  updateRecipe: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await api.post("/recipe/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to update recipe");
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  },

  // 4. Delete recipe
  deleteRecipe: async (id) => {
    try {
      const response = await api.delete(`/recipe/delete/${id}`);
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete recipe");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  },
};
