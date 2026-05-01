import { apiClient, USE_MOCKS } from "./apiClient";

export const authService = {
  async login(payload) {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        token: "mock-jwt-token",
        user: {
          id: "u1",
          name: "Nextgen Admin",
          email: payload.email,
          role: "superadmin",
        },
      };
    }
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
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