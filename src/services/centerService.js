import api from "../api/api";

export const centerService = {
  async getAllCenters() {
    const res = await api.get("/settings/center_settings");
    return res.data;
  },
  
  async createCenter(formData) {
    const res = await api.post("/settings/center_store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async updateCenter(formData) {
    const res = await api.post("/settings/center_update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteCenter(id) {
    const res = await api.delete(`/settings/center/${id}/destroy`);
    return res.data;
  },
};
