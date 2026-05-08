import api from "@/api/api";

export const serviceDetailsService = {
  async getServiceDetails(centerId) {
    const res = await api.get("/ServiceDetails", {
      params: { user_center_id: centerId },
    });
    return res.data;
  },
};
