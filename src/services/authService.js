import { apiClient, USE_MOCKS } from "./apiClient";
import api from "../api/api";

export const authService = {
  async login(payload) {
    // if (USE_MOCKS) {
    //   await new Promise((r) => setTimeout(r, 600));
    //   return {
    //     token: "mock-jwt-token",
    //     user: {
    //       id: "u1",
    //       name: "Nextgen Admin",
    //       email: payload.email,
    //       role: "superadmin",
    //     },
    //   };
    // }

    const res = await api.post("/login", payload);
    //console.log(res.data);
    return res.data;
  },

  async logout() {
    if (USE_MOCKS) return;
    await apiClient.post("/auth/logout");
  },

  async me() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};