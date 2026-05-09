
import api from "../../api/api";

export const authService = {
  async login(payload) {

    const res = await api.post("/login", payload);
    //console.log(res.data);
    return res.data;
  },
}