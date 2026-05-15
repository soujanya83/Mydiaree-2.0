import api from "@/api/api";

export const profileService = {
  async getProfile() {
    const res = await api.get("/settings/profile");
    return res.data;
  },

  async uploadProfileImage(formData) {
    const res = await api.post("/settings/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async updateProfile(id, formData) {
    const res = await api.post(`/settings/profile/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async changePassword(id, formData) {
    const res = await api.post(`/settings/profile/change-password/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
