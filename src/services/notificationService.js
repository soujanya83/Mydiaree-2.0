import api from "@/api/api";

export const notificationService = {
  async getNotifications() {
    const res = await api.get("/notifications");
    return res.data;
  },
  async markAsRead(id) {
    const res = await api.post(`/notifications/read/${id}`);
    return res.data;
  },
  async markAllAsRead() {
    const res = await api.post("/notifications/mark-all-read");
    return res.data;
  },
};
