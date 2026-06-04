import api from "../../api/api";

export const userService = {
  async saveSelectedCenter(centerId) {
    const formData = new FormData();
    formData.append("center_id", centerId);

    const res = await api.post("/user/selected-center", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async fetchSelectedCenter() {
    const res = await api.get("/user/selected-center");
    return res.data;
  },
};
