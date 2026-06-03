import api from "../../api/api";

const DEFAULT_PER_PAGE = 12;

const DATE_MAP = {
  today: "Today",
  "this-week": "This Week",
  "this-month": "This month",
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

function buildSnapshotListFormData(centerId, options = {}) {
  const {
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    roomId,
    search,
    status,
    dateRange,
    customFrom,
    customTo,
    childId,
    child_name,
    author,
  } = options;

  const formData = new FormData();

  formData.append("center_id", centerId);
  formData.append("page", page);
  formData.append("per_page", perPage);

  appendIfPresent(formData, "room_id", roomId);
  appendIfPresent(formData, "search", search?.trim());
  appendIfPresent(formData, "child_name", child_name);

  if (status && status !== "all") {
    formData.append("status", STATUS_MAP[status] || status);
  }

  if (dateRange && dateRange !== "all") {
    const dateValue = DATE_MAP[dateRange];
    if (dateValue) {
      appendArray(formData, "date[]", dateValue);
      if (dateValue === "Custom") {
        appendIfPresent(formData, "fromDate", customFrom);
        appendIfPresent(formData, "toDate", customTo);
      }
    }
  }

  appendIfPresent(formData, "child_id", childId);
  appendIfPresent(formData, "author", author);

  return formData;
}

export const snapshotService = {
  async getAllSnapshots(centerId, options = {}) {
    const res = await api.post(
      "/snapshot/mernsnapshotfilters",
      buildSnapshotListFormData(centerId, options),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

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

  async deleteSnapshotMedia(id) {
    const res = await api.delete(`/snapshot/snapshot-media/${id}`);
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

  async updateSnapshotStatus(reflectionId, status) {
    const formData = new FormData();
    formData.append("reflectionId", reflectionId);
    formData.append("status", status);
    const res = await api.post("/snapshot/status/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
