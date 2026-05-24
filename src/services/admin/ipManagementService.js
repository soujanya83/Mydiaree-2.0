import api from "@/api/api";

const multipartHeaders = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const toFormData = ({ ip, name, location, status, center_id }) => {
  const formData = new FormData();
  formData.append("wifi_ip", ip);
  formData.append("wifi_name", name);
  formData.append("wifi_address", location || "");
  formData.append("status", status);
  if (center_id) formData.append("center_id", center_id);
  return formData;
};

export const ipManagementService = {
  async getIps(centerId) {
    const params = centerId ? { center_id: centerId } : {};
    const res = await api.get("/settings/ip-manage", { params });
    return res.data;
  },

  async createIp(payload) {
    const res = await api.post("/settings/ip-manage/store", toFormData(payload), multipartHeaders);
    return res.data;
  },

  async updateIp(id, payload) {
    const res = await api.post(`/settings/ip-manage/${id}`, toFormData(payload), multipartHeaders);
    return res.data;
  },

  async toggleIpStatus(id, centerId) {
    const formData = new FormData();
    if (centerId) formData.append("center_id", centerId);
    const res = await api.post(`/settings/ip-manage/${id}/toggle`, formData, multipartHeaders);
    return res.data;
  },

  async deleteIp(id) {
    const res = await api.delete(`/settings/ip-manage/${id}`);
    return res.data;
  },
};
