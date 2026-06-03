import api from "../../api/api";

const DEFAULT_PER_PAGE = 8;

const ADDED_DATE_MAP = {
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  custom: "Custom",
};

function buildReflectionListParams(centerId, options = {}) {
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
    childId, // single child_id param (used for parent)
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

  if (childId) {
    params.child_id = String(childId);
  } else {
    const normalizedChildIds = (Array.isArray(childIds) ? childIds : [childIds])
      .map((id) => String(id).trim())
      .filter(Boolean);
    if (normalizedChildIds.length > 0) {
      params["childs[]"] = normalizedChildIds;
    }
  }

  const normalizedAuthorIds = (Array.isArray(authorIds) ? authorIds : [authorIds])
    .map((id) => String(id).trim())
    .filter(Boolean);
  if (normalizedAuthorIds.length > 0) {
    params["authors[]"] = normalizedAuthorIds;
  }

  return params;
}

export const reflectionService = {
  async getAllReflections(centerId, options = {}) {
    const res = await api.get("/reflection/mernindex", {
      params: buildReflectionListParams(centerId, options),
    });
    return res.data;
  },

  async getReflectionById(id) {
    const res = await api.get(`/reflection/view/${id}`);
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

  async deleteReflectionMedia(id) {
    const res = await api.delete(`/reflection/reflection-media/${id}`);
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

  async getRecycleBin(centerId) {
    const res = await api.get("/recycle/reflections", {
      params: { centerid: centerId },
    });
    return res.data;
  },

  async restoreReflection(id) {
    const res = await api.post(`/recycle/reflections/${id}/restore`);
    return res.data;
  },

  async permanentlyDeleteReflection(id) {
    const res = await api.delete(`/recycle/reflections/${id}`);
    return res.data;
  },
};

export { DEFAULT_PER_PAGE as REFLECTION_DEFAULT_PER_PAGE };
