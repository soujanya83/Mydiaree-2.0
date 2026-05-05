import api from "../api/api";

export const childrenService = {
  async getChildrenByRoomId(roomId) {
    const res = await api.get("/global-children", {
      params: { room_id: roomId },
    });
    return res.data;
  },
};
