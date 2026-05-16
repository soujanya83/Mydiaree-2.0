import api from "../../api/api";

export const observationService = {
  getSubjects: async () => {
    const response = await api.get("/Observation/getSubjects");
    return response.data;
  },

  getActivitiesBySubject: async (idSubject) => {
    const response = await api.get("/Observation/getActivitiesBySubject", {
      params: { idSubject },
    });
    return response.data;
  },

  getSubactivities: async (activityId) => {
    const formData = new FormData();
    formData.append("activity_id", activityId);
    const response = await api.post("/LessonPlanList/subactivities", formData);
    return response.data;
  },

  // 1. List of the Observation
  getObservations: async (center_id, per_page = 13, page = 1, filters = {}) => {
    try {
      const params = { center_id, per_page, page, ...filters };
      const response = await api.get("/observation/index", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching observations:", error);
      throw error;
    }
  },

  // 2. Save comment
  saveComment: async (observationId, comments) => {
    try {
      const formData = new FormData();
      formData.append("comments", comments);
      const response = await api.post(`/observation/${observationId}/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving comment:", error);
      throw error;
    }
  },

  // 3. Get comments
  getComments: async (observationId) => {
    try {
      const response = await api.get(`/observation/${observationId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // 4. Delete Comments
  deleteComment: async (observationId, commentId) => {
    try {
      const response = await api.delete(`/observation/${observationId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get single observation details
  getObservationDetails: async (id) => {
    try {
      const response = await api.get(`/observation/view/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching observation details:", error);
      throw error;
    }
  },

  // 5. Create Observation
  saveObservation: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle arrays like media[] or selected_staff[]
          value.forEach((item) => {
            if (item instanceof File) {
              formData.append(`${key}[]`, item);
            } else {
              formData.append(`${key}[]`, item);
            }
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await api.post("/observation/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving observation:", error);
      throw error;
    }
  },

  // 6. Update Observation (Same endpoint, just includes ID)
  updateObservation: async (data) => {
    return observationService.saveObservation(data);
  },

  // 7. Delete Observation
  deleteObservation: async (id) => {
    try {
      const response = await api.delete(`/observation/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting observation:", error);
      throw error;
    }
  },
  
  // 8. Print Observation
  printObservation: async (id) => {
    try {
      const response = await api.get("/observation/print", {
        params: { id },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error printing observation:", error);
      throw error;
    }
  },
};