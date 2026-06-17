import api from "@/api/api";

export const announcementService = {
  async getAnnouncements(centerId) {
    const res = await api.get("/announcements/mernlist", {
      params: { centerid: centerId },
    });
    return res.data;
  },

  /** GET single announcement/event for edit — query: annid */
  async getAnnouncementByAnnId(annId) {
    const res = await api.get("/announcements/view", {
      params: { annid: annId },
    });
    return res.data;
  },

  async getEvents() {
    const res = await api.get("/announcements/events");
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

  async downloadImage(imageUrl) {
    const res = await api.get("/announcements/download-image", {
      params: { image_url: imageUrl },
      responseType: "blob",
    });
    return res.data;
  },
};
