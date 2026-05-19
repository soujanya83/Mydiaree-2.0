import api from "../../api/api";

export const snapshotService = {
  async getAllSnapshots(centerId) {
    const res = await api.get("/snapshot/mernindex", {
      params: { centerid: centerId },
    });

    console.log("Snapshots response ", res);
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
