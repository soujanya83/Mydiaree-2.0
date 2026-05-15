import api from "../../api/api";

export const qipService = {
  // 1. List of the qip
  getQips: async (center_id) => {
    try {
      const response = await api.get("/qip/index", {
        params: { center_id },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching QIPs:", error);
      throw error;
    }
  },

  // 2. Create qip
  createQip: async (data) => {
    try {
      const response = await api.post("/qip/store", data);
      return response.data;
    } catch (error) {
      console.error("Error creating QIP:", error);
      throw error;
    }
  },

  // 3. Update qip (Assuming standard naming)
  updateQip: async (id, data) => {
    try {
      const response = await api.post(`/qip/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating QIP:", error);
      throw error;
    }
  },

  // 4. Delete qip
  deleteQip: async (id) => {
    try {
      const response = await api.delete(`/qip/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting QIP:", error);
      throw error;
    }
  },
};
