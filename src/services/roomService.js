import api from "../api/api";

export const roomService = {
  async getRoomsByCenterId(centerId) {
    const res = await api.get("/global-rooms", {
      params: { centerid: centerId },
    });
    return res.data;
  },
};
