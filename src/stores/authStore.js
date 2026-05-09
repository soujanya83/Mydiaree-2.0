import { create } from "zustand";
import { authService } from "@/services/auth/authService";

export const useAuthStore = create((set) => ({
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  token: localStorage.getItem("token"),
  isAuthenticated: localStorage.getItem("user") ? true : false,

  login: async (payload) => {
    try {
      const data = await authService.login(payload);
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
      }
      return data;
    } catch (error) {
      return { status: "error", message: error?.response?.data?.message || "Something went wrong" };
    }
  },

  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("activeCentreId");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
