import { create } from "zustand";
import { permissionService } from "@/services/admin/permissionService";

export const usePermissionStore = create((set) => ({
  users: [],
  permissionColumns: [],
  assignedUsers: [],
  singleUserPermission: null,
  isLoading: false,
  isFetchingAssigned: false,
  error: null,

  fetchManagePermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await permissionService.getManagePermissions();
      set({
        users: data.users || [],
        permissionColumns: data.permissionColumns || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch permissions data",
      });
    }
  },

  fetchAssignedPermissions: async (centerId) => {
    if (!centerId) return;
    set({ isFetchingAssigned: true, error: null });
    try {
      const data = await permissionService.getAssignedPermissions(centerId);
      set({
        assignedUsers: data.assigned_users || [],
        isFetchingAssigned: false,
      });
    } catch (error) {
      set({
        isFetchingAssigned: false,
        error: error?.message || "Failed to fetch assigned permissions",
      });
    }
  },

  fetchUserPermission: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await permissionService.getUserPermission(userId);
      set({
        singleUserPermission: data || null,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to fetch single user permission",
      });
    }
  },

  clearSingleUserPermission: () => {
    set({ singleUserPermission: null });
  },

  updateUserPermissions: async (userId, permissionsMap) => {
    set({ isLoading: true, error: null });
    try {
      await permissionService.updateUserPermissions(userId, permissionsMap);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to update permissions",
      });
      throw error;
    }
  },

  bulkAssignPermissions: async (userIds, permissionsMap) => {
    set({ isLoading: true, error: null });
    try {
      await permissionService.bulkAssignPermissions(userIds, permissionsMap);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.message || "Failed to bulk assign permissions",
      });
      throw error;
    }
  },
}));
