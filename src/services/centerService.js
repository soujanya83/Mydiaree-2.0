import api from "../api/api";

export const centerService = {
  async getAllCenters() {
    const res = await api.get("/centers");
    return res.data;
  },
};
