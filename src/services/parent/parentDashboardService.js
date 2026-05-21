import api from "@/api/api";

export const parentDashboardService = {
  async getDashboard(centerId) {
    const res = await api.get("/parent-dashboard", {
      params: { centerid: centerId },
    });
    return res.data;
  },
};
