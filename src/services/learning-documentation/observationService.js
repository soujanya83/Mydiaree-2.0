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
};