import api from "@/api/api";

const multipartHeaders = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const toFormData = ({ ip, name, location, status }) => {
  const formData = new FormData();
  formData.append("wifi_ip", ip);
  formData.append("wifi_name", name);
  formData.append("wifi_address", location || "");
  formData.append("status", status);
  return formData;
};

export const ipManagementService = {
  async getIps() {
    const res = await api.get("/settings/ip-manage");
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

  async toggleIpStatus(id) {
    const res = await api.post(`/settings/ip-manage/${id}/toggle`);
    return res.data;
  },

  async deleteIp(id) {
    const res = await api.delete(`/settings/ip-manage/${id}`);
    return res.data;
  },
};
