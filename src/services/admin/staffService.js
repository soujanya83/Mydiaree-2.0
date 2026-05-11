import api from "../../api/api";

export const staffService = {
  async getStaffSettings(centerId) {
    const res = await api.get(`/settings/staff_settings`, {
      params: { center_id: centerId },
    });
    return res.data;
  },

  async createStaff(formData) {
    const res = await api.post("/settings/staff/store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async updateStaff(formData) {
    // Both use /settings/staff/store
    const res = await api.post("/settings/staff/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteStaff(id) {
    const res = await api.delete(`/settings/staff/destroy/${id}`);
    return res.data;
  },
};
