import api from "../../api/api";

export const parentService = {
  async getParentSettings({ center_id, search = "", page = 1, per_page = 10 }) {
    try {
      const res = await api.get(`/settings/parent_settings`, {
        params: { center_id, search, page, per_page },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching parent settings:", error);
      throw error;
    }
  },

  async getParentDetails(id) {
    try {
      const res = await api.get(`/settings/parent/${id}/get`);
      return res.data;
    } catch (error) {
      console.error("Error fetching parent details:", error);
      throw error;
    }
  },

  async getGlobalParentChildren(parentId) {
    try {
      const res = await api.get(`/global-parent-children/${parentId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching parent children:", error);
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
