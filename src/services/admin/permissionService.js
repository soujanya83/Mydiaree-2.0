import api from "../../api/api";

export const permissionService = {
  // 1. List of permissions and users (New API)
  getAllPermissions: async (centerId) => {
    try {
      const response = await api.get("/settings/all-permissions", {
        params: centerId ? { center_id: centerId } : {},
      });
      if (response.data && response.data.status) {
        return response.data.data; // returns array of module objects
      }
      throw new Error("Failed to fetch all permissions");
    } catch (error) {
      console.error("Error fetching all permissions:", error);
      throw error;
    }
  },

  // Keep old one for now if needed, but we will mostly use getAllPermissions
  getManagePermissions: async (centerId) => {
    try {
      const response = await api.get("/settings/manage_permissions", {
        params: centerId ? { center_id: centerId } : {},
      });
      if (response.data && response.data.success) {
        return response.data.data; // returns { users: [], permissionColumns: [] }
      }
      throw new Error("Failed to fetch manage permissions");
    } catch (error) {
      console.error("Error fetching manage permissions:", error);
      throw error;
    }
  },

  // 2. List of assigned user permissions by center
  getAssignedPermissions: async ({ center_id, page = 1, per_page = 10, search = "" }) => {
    try {
      const response = await api.get("/settings/permissions-assigned", {
        params: { center_id, page, per_page, search },
      });
      if (response.data && response.data.status) {
        return response.data; // returns the full response object containing data, pagination, filters
      }
      throw new Error(response.data?.message || "Failed to fetch assigned permissions");
    } catch (error) {
      console.error("Error fetching assigned permissions:", error);
      throw error;
    }
  },

  // 3. List roles by center
  getRoles: async (centerId) => {
    try {
      const response = await api.get("/settings/roles", {
        params: { center_id: centerId },
      });
      if (response.data && response.data.status) {
        return response.data.data; // returns { center_id, total, roles: [] }
      }
      throw new Error(response.data?.message || "Failed to fetch roles");
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  // 4. Create role
  createRole: async (centerId, role) => {
    try {
      const formData = new FormData();
      formData.append("center_id", centerId);
      formData.append("role", role);

      const response = await api.post("/settings/roles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create role");
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  // 5. Get role details
  getRoleDetails: async (roleId) => {
    try {
      const response = await api.get(`/settings/roles/${roleId}`);
      if (response.data && response.data.status) {
        return response.data.data; // returns { role, permissions: [] }
      }
      throw new Error(response.data?.message || "Failed to fetch role details");
    } catch (error) {
      console.error("Error fetching role details:", error);
      throw error;
    }
  },

  // 6. Delete role
  deleteRole: async (roleId) => {
    try {
      const response = await api.delete(`/settings/roles/${roleId}`);
      if (response.data && response.data.status) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to delete role");
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  },

  // 7. Update role permissions
  updateRolePermissions: async (roleId, permissionsMap, centerId) => {
    try {
      const formData = new FormData();
      if (centerId) {
        formData.append("center_id", centerId);
      }
      Object.entries(permissionsMap).forEach(([key, value]) => {
        if (Number(value) === 1) {
          formData.append(`permissions[${key}]`, 1);
        }
      });

      const response = await api.post(`/settings/roles/${roleId}/permissions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to update role permissions");
    } catch (error) {
      console.error("Error updating role permissions:", error);
      throw error;
    }
  },

  // 8. Get single user permission
  getUserPermission: async (userId, centerId) => {
    try {
      const formData = new FormData();
      formData.append("userid", userId);
      if (centerId) {
        formData.append("center_id", centerId);
      }
      const response = await api.post("/settings/user/permissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.status) {
        return response.data.data; // returns { user, permissions }
      }
      throw new Error(response.data?.message || "Failed to fetch user permissions");
    } catch (error) {
      console.error("Error fetching user permission:", error);
      throw error;
    }
  },

  // 9. Update user permissions (uses the same bulk API but for a single user)
  updateUserPermissions: async (userId, permissionsMap, centerId) => {
    try {
      const formData = new FormData();
      formData.append("user_ids[]", userId);
      if (centerId) {
        formData.append("centerid", centerId);
      }

      // Add permissions in permissions[key] format
      Object.entries(permissionsMap).forEach(([key, value]) => {
        if(value)
        formData.append(`permissions[${key}]`, 1);
      });

      const response = await api.post("/settings/assign-permissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to update permissions");
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw error;
    }
  },

  // 10. Bulk assign permissions
  bulkAssignPermissions: async (userIds, permissionsMap, centerId) => {
    try {
      const formData = new FormData();
      if (centerId) {
        formData.append("centerid", centerId);
      }

      // Add user ids
      userIds.forEach((id) => {
        formData.append("user_ids[]", id);
      });

      // Add permissions in permissions[key] format
      Object.entries(permissionsMap).forEach(([key, value]) => {
        if (value)
          formData.append(`permissions[${key}]`, 1);
      });

      const response = await api.post("/settings/assign-permissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.success) {
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to bulk assign permissions");
    } catch (error) {
      console.error("Error bulk assigning permissions:", error);
      throw error;
    }
  },
};
