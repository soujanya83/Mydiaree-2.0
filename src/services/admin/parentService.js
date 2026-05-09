import api from "../../api/api";

export const parentService = {
  async getParentSettings(centerId) {
    try {
      const res = await api.get(`/settings/parent_settings`, {
        params: { center_id: centerId },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching parent settings:", error);
      throw error;
    }
  },

  async createParent(formData) {
    try {
      const res = await api.post(`/settings/parent/store`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      if (error.response?.data) return error.response.data;
      console.error("Error creating parent:", error);
      throw error;
    }
  },

  async updateParent(formData) {
    try {
      const res = await api.post(`/settings/parent/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      if (error.response?.data) return error.response.data;
      console.error("Error updating parent:", error);
      throw error;
    }
  },

  async deleteParent(id) {
    try {
      const res = await api.delete(`/settings/parent/destroy/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting parent:", error);
      throw error;
    }
  },
};
