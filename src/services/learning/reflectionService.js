import api from "../../api/api";

export const reflectionService = {
  async getAllReflections(centerId) {
    const res = await api.get("/reflection/index", {
      params: { center_id: centerId },
    });
    console.log("Reflection service response ", res);
    
        return res.data;
  },

  async storeReflection(formData) {
    const res = await api.post("/reflection/store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async updateStatus(reflectionId, status) {
    const formData = new FormData();
    formData.append("reflectionId", reflectionId);
    formData.append("status", status);
    const res = await api.post("/reflection/status/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteReflection(id) {
    const res = await api.delete(`/reflection/delete/${id}`);
    return res.data;
  },

  async getEylfOutcomes() {
    const res = await api.get("/LessonPlanList/eylf");
    return res.data;
  },

  async getRoomsAndStaff(centerId) {
    const formData = new FormData();
    formData.append("user_center_id", centerId);
    const res = await api.post("/rooms", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async printReflection(id) {
    const res = await api.get("/reflection/print", {
      params: { id },
      responseType: "blob",
    });
    return res.data;
  },
};
