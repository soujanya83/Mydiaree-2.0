import api from "../../api/api";

export const childrenService = {
  // 1. List of all the child (filtered)
  filterChildren: async (filters) => {
    try {
      const formData = new FormData();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "all") {
          formData.append(key, value);
        }
      });

      const response = await api.post("/children/filter", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error filtering children:", error);
      throw error;
    }
  },

  // 2. Create child
  createChild: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "days" && Array.isArray(value)) {
          value.forEach((day) => formData.append("days[]", day));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await api.post("/child/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating child:", error);
      throw error;
    }
  },

  // 3. Update child
  updateChild: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "days" && Array.isArray(value)) {
          value.forEach((day) => formData.append("days[]", day));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await api.post("/child/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating child:", error);
      throw error;
    }
  },

  // 4. Delete child
  deleteChildren: async (childIds) => {
    try {
      const formData = new FormData();
      childIds.forEach((id) => formData.append("child_ids[]", id));

      const response = await api.post("/children/delete-selected", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting children:", error);
      throw error;
    }
  },
};
