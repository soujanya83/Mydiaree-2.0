import { create } from "zustand";
import { permissionService } from "@/services/admin/permissionService";

export const usePermissionStore = create((set) => ({
  users: [],
  roles: [],
  permissionColumns: [],
  assignedUsers: [],
  singleUserPermission: null,
  selectedRoleDetails: null,
  modulePermissions: [],
  isLoading: false,

  fetchManagePermissions: async (centerId) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Get nested permissions structure
      const modules = await permissionService.getAllPermissions();

      // 2. Extract all permissions into a flat list for compatibility
      const flatPermissions = [];
      modules.forEach((mod) => {
        if (mod.permissions) {
          mod.permissions.forEach((p) => {
            flatPermissions.push({ name: p.name, label: p.label });
          });
        }
        if (mod.submodules) {
          mod.submodules.forEach((sub) => {
            if (sub.permissions) {
              sub.permissions.forEach((p) => {
                flatPermissions.push({ name: p.name, label: p.label });
              });
            }
          });
        }
      });

      set({
        modulePermissions: modules,
        permissionColumns: flatPermissions,
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

  fetchRoles: async (centerId) => {
    if (!centerId) return;
    set({ isFetchingRoles: true, error: null });
    try {
      const data = await permissionService.getRoles(centerId);
      set({
        roles: data.roles || [],
        isFetchingRoles: false,
      });
    } catch (error) {
      set({
        isFetchingRoles: false,
        error: error?.response?.data?.message || error?.message || "Failed to fetch roles",
      });
    }
  },

  createRole: async (centerId, role) => {
    set({ isLoading: true, error: null });
    try {
      await permissionService.createRole(centerId, role);
      const data = await permissionService.getRoles(centerId);
      set({
        roles: data.roles || [],
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error?.message || "Failed to create role",
      });
      throw error;
    }
  },

  fetchRoleDetails: async (roleId) => {
    if (!roleId) return null;
    set({ isFetchingRoleDetails: true, error: null });
    try {
      const data = await permissionService.getRoleDetails(roleId);
      set({
        selectedRoleDetails: data || null,
        isFetchingRoleDetails: false,
      });
      return data;
    } catch (error) {
      set({
        isFetchingRoleDetails: false,
        error: error?.response?.data?.message || error?.message || "Failed to fetch role details",
      });
      throw error;
    }
  },

  clearSelectedRoleDetails: () => {
    set({ selectedRoleDetails: null });
  },

  deleteRole: async (roleId, centerId) => {
    set({ isLoading: true, error: null });
    try {
      await permissionService.deleteRole(roleId);
      const data = centerId ? await permissionService.getRoles(centerId) : { roles: [] };
      set({
        roles: data.roles || [],
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error?.message || "Failed to delete role",
      });
      throw error;
    }
  },

  updateRolePermissions: async (roleId, permissionsMap) => {
    set({ isLoading: true, error: null });
    try {
      const role = await permissionService.updateRolePermissions(roleId, permissionsMap);
      set({ isLoading: false });
      return role;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message || error?.message || "Failed to update role permissions",
      });
      throw error;
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
