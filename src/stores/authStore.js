import { create } from "zustand";
import { authService } from "@/services/auth/authService";
import { permissionService } from "@/services/admin/permissionService";

function shouldFetchPermissions(user) {
  if (!user) return false;
  const type = user.userType;
  return type !== "Superadmin" && type !== "Centeradmin" && type !== "Parent";
}

function getInitialPermissionsLoading() {
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return false;
    const user = JSON.parse(userRaw);
    return shouldFetchPermissions(user) && !localStorage.getItem("userPermissions");
  } catch {
    return false;
  }
}

export const useAuthStore = create((set, get) => ({
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  token: localStorage.getItem("token"),
  isAuthenticated: localStorage.getItem("user") ? true : false,
  userPermissions: localStorage.getItem("userPermissions")
    ? JSON.parse(localStorage.getItem("userPermissions"))
    : null,
  permissionsLoading: getInitialPermissionsLoading(),

  login: async (payload) => {
    try {
      const data = await authService.login(payload);
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });

        // Parents use a fixed view-only module list — no permission API
        if (data.user.userType === "Parent") {
          localStorage.removeItem("userPermissions");
          set({ userPermissions: null, permissionsLoading: false });
        } else if (shouldFetchPermissions(data.user)) {
          set({ permissionsLoading: true });
          try {
            const permData = await permissionService.getUserPermission(data.user.userid);
            // API may return { permissions: {...} } OR the flat object directly
            const permissions = permData?.permissions ?? permData ?? null;
            localStorage.setItem("userPermissions", JSON.stringify(permissions));
            set({ userPermissions: permissions, permissionsLoading: false });
          } catch (permError) {
            console.error("Failed to fetch user permissions:", permError);
            // Don't block login if permission fetch fails
            set({ userPermissions: null, permissionsLoading: false });
          }
        } else {
          // Superadmin / Centeradmin — full access via hook; no permission API
          localStorage.removeItem("userPermissions");
          set({ userPermissions: null, permissionsLoading: false });
        }
      }
      return data;
    } catch (error) {
      set({ permissionsLoading: false });
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
    if (!shouldFetchPermissions(user)) {
      set({ permissionsLoading: false });
      return;
    }
    set({ permissionsLoading: true });
    try {
      const permData = await permissionService.getUserPermission(user.userid);
      const permissions = permData?.permissions ?? permData ?? null;
      localStorage.setItem("userPermissions", JSON.stringify(permissions));
      set({ userPermissions: permissions, permissionsLoading: false });
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
      set({ permissionsLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("activeCentreId");
    localStorage.removeItem("userPermissions");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      userPermissions: null,
      permissionsLoading: false,
    });
  },
}));
