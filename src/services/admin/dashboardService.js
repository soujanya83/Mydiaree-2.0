import api from "@/api/api";

export const dashboardService = {
  async getDashboardData(centerId = 1) {
    const formData = new FormData();
    formData.append("center_id", centerId);
    
    const res = await api.post("/newdashboard", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
