import api from "../../api/api";

const DEFAULT_PER_PAGE = 12;

function buildSnapshotListParams(centerId, options = {}) {
  const { page = 1, perPage = DEFAULT_PER_PAGE } = options;

  return {
    centerid: centerId,
    per_page: perPage,
    page,
  };
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
