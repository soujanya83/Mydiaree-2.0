import api from "../../api/api";

export const ingredientTypeService = {
  // Get all ingredient types
  getTypes: async () => {
    try {
      const response = await api.get("/ingredient-types");
      if (response.data && response.data.status === "success") {
        return response.data.ingredient_types || [];
      }
      throw new Error(response.data?.message || "Failed to fetch ingredient types");
    } catch (error) {
      console.error("Error fetching ingredient types:", error);
      throw error;
    }
  },

  // Create ingredient type
  createType: async (name) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      const response = await api.post("/ingredient-types", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create ingredient type");
    } catch (error) {
      console.error("Error creating ingredient type:", error);
      throw error;
    }
  },

  // Update ingredient type
  updateType: async (id, name) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      const response = await api.post(`/ingredient-types/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to update ingredient type");
    } catch (error) {
      console.error("Error updating ingredient type:", error);
      throw error;
    }
  },

  // Delete ingredient type
  deleteType: async (id) => {
    try {
      const response = await api.delete(`/ingredient-types/${id}`);
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete ingredient type");
    } catch (error) {
      console.error("Error deleting ingredient type:", error);
      throw error;
    }
  },
};
