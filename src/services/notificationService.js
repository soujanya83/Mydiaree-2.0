import api from "@/api/api";

export const notificationService = {
  async getNotifications() {
    const res = await api.get("/notifications");
    return res.data;
  },
};
