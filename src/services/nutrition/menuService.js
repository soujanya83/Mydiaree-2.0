import api from "../../api/api";

export const menuService = {
  // 1. Get Menu on a specific date
  getMenu: async (centerId, selectedDate) => {
    try {
      const response = await api.get("/healthy-menu", {
        params: { center_id: centerId, selected_date: selectedDate },
      });
      if (response.data && response.data.status === "success") {
        return response.data; // returns { menus, selected_date, selected_day, ... }
      }
      throw new Error(response.data?.message || "Failed to fetch menu");
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw error;
    }
  },

  // 2. Add recipe to menu
  addRecipesToMenu: async (data) => {
    try {
      const formData = new FormData();
      formData.append("center_id", data.centerId);
      formData.append("selected_date", data.selectedDate);
      formData.append("day", data.day);
      formData.append("meal_type", data.mealType);
      
      if (Array.isArray(data.recipeIds)) {
        data.recipeIds.forEach((id) => formData.append("recipe_ids[]", id));
      }
      
      if (data.menuweek) {
        formData.append("menuweek", data.menuweek);
      }

      const response = await api.post("/save-recipes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to add recipes to menu");
    } catch (error) {
      console.error("Error adding recipes to menu:", error);
      throw error;
    }
  },

  // 4. Delete menu
  deleteMenu: async (id) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      if (response.data && response.data.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete menu item");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      throw error;
    }
  },
};
