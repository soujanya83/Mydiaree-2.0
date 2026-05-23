import api from "@/api/api";

export const parentDashboardService = {
  async getParentChildren(parentId) {
    const res = await api.get(`/global-parent-children/${parentId}`);
    return res.data;
  },
  async getDashboard(centerId) {
    // kept for dashboard widget usage
    const res = await api.get("/parent-dashboard", {
      params: { centerid: centerId },
    });
    return res.data;
  },

  async getSelectedChild() {
    const res = await api.get("/parent-dashboard/selected-child");
    return res.data;
  },

  async saveSelectedChild(childId) {
    const formData = new FormData();
    formData.append("child_id", String(childId));

    const res = await api.post("/parent-dashboard/selected-child", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
