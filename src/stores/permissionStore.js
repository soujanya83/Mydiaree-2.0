import { create } from "zustand";
import { permissionService } from "@/services/admin/permissionService";

export const usePermissionStore = create((set) => ({
  users: [],
  roles: [],
  permissionColumns: [],
  assignedUsers: [],
  assignedPagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  singleUserPermission: null,
  selectedRoleDetails: null,
  modulePermissions: [],
  isLoading: false,

  fetchManagePermissions: async (centerId) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Get nested permissions structure
      const modules = await permissionService.getAllPermissions(centerId);

      // 2. Extract all permissions into a flat list for compatibility
      const flatPermissions = [];
      modules.forEach((mod) => {
        if (mod.permissions) {
          mod.permissions.forEach((p) => {
            flatPermissions.push({ name: p.name, label: p.label });
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

  fetchAssignedPermissions: async (centerId, params = {}) => {
    if (!centerId) return;
    set({ isFetchingAssigned: true, error: null });
    try {
      const response = await permissionService.getAssignedPermissions({
        center_id: centerId,
        ...params,
      });
      const dataObj = response.data || {};
      const assignedUsersData = dataObj.assigned_users || {};
      const assignedUsersList = assignedUsersData.data || (Array.isArray(assignedUsersData) ? assignedUsersData : []);
      const pagination = response.pagination || {
        current_page: assignedUsersData.current_page || 1,
        last_page: assignedUsersData.last_page || 1,
        total: assignedUsersData.total || 0,
        per_page: assignedUsersData.per_page || 10,
      };

      set({
        assignedUsers: assignedUsersList,
        assignedPagination: pagination,
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

  updateRolePermissions: async (roleId, permissionsMap, centerId) => {
    set({ isLoading: true, error: null });
    try {
      const role = await permissionService.updateRolePermissions(roleId, permissionsMap, centerId);
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

  fetchUserPermission: async (userId, centerId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await permissionService.getUserPermission(userId, centerId);
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

  updateUserPermissions: async (userId, permissionsMap, centerId) => {
    set({ isLoading: true, error: null });
    try {
      await permissionService.updateUserPermissions(userId, permissionsMap, centerId);
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

  bulkAssignPermissions: async (userIds, permissionsMap, centerId) => {
    set({ isLoading: true, error: null });
    try {
      await permissionService.bulkAssignPermissions(userIds, permissionsMap, centerId);
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
