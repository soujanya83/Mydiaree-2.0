import api from "../../api/api";

const DEFAULT_PER_PAGE = 13;

const ADDED_DATE_MAP = {
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  custom: "Custom",
};

const STATUS_MAP = {
  draft: "Draft",
  published: "Published",
};

function appendIfPresent(formData, key, value) {
  if (value !== null && value !== undefined && value !== "") {
    formData.append(key, value);
  }
}

function appendArray(formData, key, values = []) {
  const normalizedValues = (Array.isArray(values) ? values : [values])
    .map((value) => String(value).trim())
    .filter(Boolean);

  normalizedValues.forEach((value) => formData.append(key, value));
}

function buildObservationListFormData(centerId, options = {}) {
  const {
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    roomId,
    search,
    status,
    dateRange,
    customFrom,
    customTo,
    childIds = [],
    authorIds = [],
    childSearch = "",
    createdBySearch = "",
    childId,
  } = options;

  const formData = new FormData();

  formData.append("center_id", centerId);
  formData.append("per_page", perPage);
  formData.append("page", page);

  appendIfPresent(formData, "room_id", roomId);
  appendIfPresent(formData, "search", search?.trim());

  if (status && status !== "all") {
    appendArray(formData, "observations[]", STATUS_MAP[status] || status);
  }

  if (dateRange && dateRange !== "all") {
    const added = ADDED_DATE_MAP[dateRange];
    if (added) {
      appendArray(formData, "added[]", added);
      if (added === "Custom") {
        appendIfPresent(formData, "fromDate", customFrom);
        appendIfPresent(formData, "toDate", customTo);
      }
    }
  }

  if (childId) {
    formData.append("child_id", childId);
  } else {
    appendArray(formData, "childs[]", childIds);
  }

  appendArray(formData, "authors[]", authorIds);
  appendIfPresent(formData, "child_search", childSearch?.trim());
  appendIfPresent(formData, "created_by_search", createdBySearch?.trim());

  return formData;
}

const postObservationMultipart = async (url, fields) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });
  const response = await api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

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

  getAssessmentSubjects: async (framework) => {
    const response = await api.get("/observation-api/subjects", {
      params: { framework },
    });
    return response.data;
  },

  getAssessmentModules: async ({ framework, subjectId }) => {
    const response = await api.get("/observation-api/modules", {
      params: { framework, subject_id: subjectId },
    });
    return response.data;
  },

  getAssessmentSubmodules: async ({ framework, moduleId }) => {
    const response = await api.get("/observation-api/submodules", {
      params: { framework, module_id: moduleId },
    });
    return response.data;
  },

  saveMontessoriAssessment: async ({ observationId, subactivities }) => {
    const response = await api.post("/observation-api/montessori", {
      observationId,
      subactivities,
    });
    return response.data;
  },

  saveEylfAssessment: async ({ observationId, subactivityIds }) => {
    const response = await api.post("/observation-api/eylf", {
      observationId,
      subactivityIds,
    });
    return response.data;
  },

  getDevelopmentMilestoneSubjects: async () => {
    const response = await api.get("/observation-api/devmilestone/subjects");
    return response.data;
  },

  getDevelopmentMilestoneModules: async (ageId) => {
    const response = await api.get("/observation-api/devmilestone/modules", {
      params: { age_id: ageId },
    });
    return response.data;
  },

  getDevelopmentMilestoneSubmodules: async (milestoneId) => {
    const response = await api.get("/observation-api/devmilestone/submodules", {
      params: { milestone_id: milestoneId },
    });
    return response.data;
  },

  saveDevelopmentMilestone: async ({ observationId, selections }) => {
    const response = await api.post("/observation-api/development-milestone", {
      observationId,
      selections,
    });
    return response.data;
  },

  getLinkedProgramPlans: async (obsId) => {
    const response = await api.get("/observation-api/link/program-plan", {
      params: { obsId },
    });
    return response.data;
  },

  saveLinkedProgramPlans: async ({ obsId, programplanids }) => {
    const response = await api.post("/observation-api/link/program-plan", {
      obsId,
      programplanids,
    });
    return response.data;
  },

  getLinkedReflections: async (obsId) => {
    const response = await api.get("/observation-api/link/reflection", {
      params: { obsId },
    });
    return response.data;
  },

  saveLinkedReflections: async ({ obsId, reflection_ids }) => {
    const response = await api.post("/observation-api/link/reflection", {
      obsId,
      reflection_ids,
    });
    return response.data;
  },

  getLinkedObservations: async (obsId) => {
    const response = await api.get("/observation-api/link/observation", {
      params: { obsId },
    });
    return response.data;
  },

  saveLinkedObservations: async ({ obsId, observation_ids }) => {
    const response = await api.post("/observation-api/link/observation", {
      obsId,
      observation_ids,
    });
    return response.data;
  },

  /** FormData: idSubject, title, center_id */
  addActivity: async (payload) => postObservationMultipart("/Observation/addActivity", payload),

  /** FormData: idActivity, title */
  updateActivity: async (payload) =>
    postObservationMultipart("/Observation/updateActivity", payload),

  /** FormData: idActivity */
  deleteActivity: async (idActivity) =>
    postObservationMultipart("/Observation/deleteActivity", { idActivity }),

  /** FormData: idActivity, title, center_id */
  addSubActivity: async (payload) =>
    postObservationMultipart("/Observation/addSubActivity", payload),

  /** FormData: idSubActivity, title */
  updateSubActivity: async (payload) =>
    postObservationMultipart("/Observation/updateSubActivity", payload),

  /** FormData: idSubActivity */
  deleteSubActivity: async (idSubActivity) =>
    postObservationMultipart("/Observation/deleteSubActivity", { idSubActivity }),

  // 1. List of the Observation
  getObservations: async (centerId, options = {}) => {
    try {
      const response = await api.post(
        "/observation/mernfilters",
        buildObservationListFormData(centerId, options),
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
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

  getRecycleBin: async (centerId) => {
    try {
      const response = await api.get("/recycle/observations", {
        params: { centerid: centerId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching observation recycle bin:", error);
      throw error;
    }
  },

  restoreObservation: async (id) => {
    try {
      const response = await api.post(`/recycle/observations/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error("Error restoring observation:", error);
      throw error;
    }
  },

  permanentlyDeleteObservation: async (id) => {
    try {
      const response = await api.delete(`/recycle/observations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error permanently deleting observation:", error);
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

  // 9. Get Rooms and Staff
  getRoomsAndStaff: async (centerId) => {
    try {
      const formData = new FormData();
      formData.append("user_center_id", centerId);
      const response = await api.post("/rooms", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching rooms and staff:", error);
      throw error;
    }
  },
};
