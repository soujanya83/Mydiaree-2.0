import api from "../../api/api";

export const permissionService = {
  // 1. List of permissions and users
  getManagePermissions: async () => {
    try {
      const response = await api.get("/settings/manage_permissions");
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
  getAssignedPermissions: async (centerId) => {
    try {
      const response = await api.get("/settings/permissions-assigned", {
        params: { center_id: centerId },
      });
      if (response.data && response.data.status) {
        return response.data.data; // returns { center_id, total, assigned_users: [] }
      }
      throw new Error(response.data?.message || "Failed to fetch assigned permissions");
    } catch (error) {
      console.error("Error fetching assigned permissions:", error);
      throw error;
    }
  },

  // 3. Get single user permission
  getUserPermission: async (userId) => {
    try {
      const formData = new FormData();
      formData.append("userid", userId);
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

  // 4. Update user permissions (uses the same bulk API but for a single user)
  updateUserPermissions: async (userId, permissionsMap) => {
    try {
      const formData = new FormData();
      formData.append("user_ids[]", userId);
      
      // Add permissions in permissions[key] format
      Object.entries(permissionsMap).forEach(([key, value]) => {
        formData.append(`permissions[${key}]`, value ? 1 : 0);
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

  // 5. Bulk assign permissions
  bulkAssignPermissions: async (userIds, permissionsMap) => {
    try {
      const formData = new FormData();
      
      // Add user ids
      userIds.forEach((id) => {
        formData.append("user_ids[]", id);
      });

      // Add permissions in permissions[key] format
      Object.entries(permissionsMap).forEach(([key, value]) => {
        formData.append(`permissions[${key}]`, value ? 1 : 0);
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

