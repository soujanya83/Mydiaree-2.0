import { create } from "zustand";
import { authService } from "@/services/auth/authService";
import { permissionService } from "@/services/admin/permissionService";

export const useAuthStore = create((set, get) => ({
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  token: localStorage.getItem("token"),
  isAuthenticated: localStorage.getItem("user") ? true : false,
  userPermissions: localStorage.getItem("userPermissions")
    ? JSON.parse(localStorage.getItem("userPermissions"))
    : null,

  login: async (payload) => {
    try {
      const data = await authService.login(payload);
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });

        // Fetch permissions after login
        // Superadmin gets all permissions implicitly — no need to fetch
        if (data.user.userType !== "Superadmin") {
          try {
            const permData = await permissionService.getUserPermission(data.user.userid);
            // API may return { permissions: {...} } OR the flat object directly
            const permissions = permData?.permissions ?? permData ?? null;
            localStorage.setItem("userPermissions", JSON.stringify(permissions));
            set({ userPermissions: permissions });
          } catch (permError) {
            console.error("Failed to fetch user permissions:", permError);
            // Don't block login if permission fetch fails
            set({ userPermissions: null });
          }
        } else {
          // Superadmin — clear any stale permissions, hook handles bypass
          localStorage.removeItem("userPermissions");
          set({ userPermissions: null });
        }
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

  updateUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  /**
   * Re-fetch the current user's permissions (e.g. after centre switch).
   */
  refreshPermissions: async () => {
    const { user } = get();
    if (!user || user.userType === "Superadmin") return;
    try {
      const permData = await permissionService.getUserPermission(user.userid);
      const permissions = permData?.permissions ?? permData ?? null;
      localStorage.setItem("userPermissions", JSON.stringify(permissions));
      set({ userPermissions: permissions });
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("activeCentreId");
    localStorage.removeItem("userPermissions");
    set({ user: null, token: null, isAuthenticated: false, userPermissions: null });
  },
}));
