import api from "../../api/api";

export const superAdminService = {
  async getSuperAdmins() {
    const response = await api.get("/settings/superadmin_settings");
    return response.data;
  },

  async createSuperAdmin(formData) {
    const response = await api.post("/settings/superadmin/store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteSuperAdmin(id) {
    const formData = new FormData();
    formData.append("id", id);
    const response = await api.post("/settings/superadmin/delete", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
