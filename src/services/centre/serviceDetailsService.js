import api from "@/api/api";

export const serviceDetailsService = {
  async getServiceDetails(centerId) {
    const res = await api.get("/ServiceDetails", {
      params: { user_center_id: centerId },
    });
    return res.data;
  },

  async updateServiceDetails(formData) {
    const res = await api.post("/ServiceDetails", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
