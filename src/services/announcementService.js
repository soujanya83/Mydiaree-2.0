import api from "@/api/api";

export const announcementService = {
  async getAnnouncements(centerId) {
    const res = await api.get("/announcements/list", {
      params: { centerid: centerId },
    });
    return res.data;
  },

  async saveAnnouncement(formData) {
    const res = await api.post("/announcements/store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteAnnouncement(announcementId) {
    const res = await api.delete("/announcements/delete", {
      params: { announcementid: announcementId },
    });
    return res.data;
  },
};
