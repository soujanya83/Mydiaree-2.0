import api from "../../api/api";

const DEFAULT_PER_PAGE = 12;

const ADDED_DATE_MAP = {
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  custom: "Custom",
};

function buildSnapshotListParams(centerId, options = {}) {
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
    centerid: centerId,
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

export const snapshotService = {
  async getAllSnapshots(centerId, options = {}) {
    const res = await api.get("/snapshot/mernindex", {
      params: buildSnapshotListParams(centerId, options),
    });

    return res.data;
  },

  async storeSnapshot(formData) {
    const res = await api.post("/snapshot/store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteSnapshot(id) {
    const res = await api.delete(`/snapshot/snapshotsdelete/${id}`);
    return res.data;
  },

  async getRecycleBin(centerId) {
    const res = await api.get("/recycle/snapshots", {
      params: { centerid: centerId },
    });
    return res.data;
  },

  async restoreSnapshot(id) {
    const res = await api.post(`/recycle/snapshots/${id}/restore`);
    return res.data;
  },

  async permanentlyDeleteSnapshot(id) {
    const res = await api.delete(`/recycle/snapshots/${id}`);
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

  async printSnapshot(id) {
    const res = await api.get(`/snapshot/print/${id}`, {
      responseType: "blob",
    });
    return res.data;
  },
};
