import api from "../../api/api";

const DEFAULT_PER_PAGE = 13;

const ADDED_DATE_MAP = {
  today: "Today",
  "this-week": "This Week",
  "last-week": "Last Week",
  "this-month": "This Month",
  custom: "Custom",
};

function buildObservationListParams(centerId, options = {}) {
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
  } = options;

  const params = {
    center_id: centerId,
    per_page: perPage,
    page,
  };

  if (roomId) params.room_id = roomId;
  if (search?.trim()) params.search = search.trim();

  if (status && status !== "all") {
    params["observations[]"] = String(status).toUpperCase();
  }

  if (dateRange && dateRange !== "all") {
    const added = ADDED_DATE_MAP[dateRange];
    if (added) {
      params["added[]"] = added;
      if (added === "Custom") {
        if (customFrom) params.fromDate = customFrom;
        if (customTo) params.toDate = customTo;
      }
    }
  }

  const normalizedChildIds = (Array.isArray(childIds) ? childIds : [childIds])
    .map((id) => String(id).trim())
    .filter(Boolean);
  if (normalizedChildIds.length > 0) {
    params["childs[]"] = normalizedChildIds;
  }

  const normalizedAuthorIds = (Array.isArray(authorIds) ? authorIds : [authorIds])
    .map((id) => String(id).trim())
    .filter(Boolean);
  if (normalizedAuthorIds.length > 0) {
    params["authors[]"] = normalizedAuthorIds;
  }

  return params;
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
      const response = await api.get("/observation/index", {
        params: buildObservationListParams(centerId, options),
      });
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
