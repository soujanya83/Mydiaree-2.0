import api from "../../api/api";

export const staffService = {
  async getStaffSettings({ center_id, search = "", page = 1, per_page = 10, roomid }) {
    const params = { center_id, search, page, per_page };
    if (roomid) params.roomid = roomid;

    const res = await api.get(`/settings/staff_settings`, {
      params,
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

  async updateWifiAccess(formData) {
    const res = await api.post("/settings/staff/wifi-access", formData, {
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

  async updateStaffStatus(id) {
    const res = await api.post(`/settings/staff/status/${id}`);
    return res.data;
  },
};
