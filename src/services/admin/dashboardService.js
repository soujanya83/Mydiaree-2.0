import api from "@/api/api";

export const dashboardService = {
  async getDashboardData(centerId = 1) {
    const formData = new FormData();
    formData.append("center_id", centerId);

    const res = await api.get("/newdashboard", {
      params: {
        centerid: centerId,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  async getBirthdays() {
    const res = await api.get("/users/birthday");
    return res.data;
  },
};
