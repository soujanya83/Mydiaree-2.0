import api from "../../api/api";

export const roomService = {
  /**
   * Fetch rooms list + staff/educators for a given center.
   * POST /rooms  body: { user_center_id }
   */
  async fetchRooms(centerId) {
    const formData = new FormData();
    formData.append("user_center_id", String(centerId));
    const res = await api.post("/rooms", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * Create a new room.
   * POST /room-create  body (formData):
   *   dcenterid, room_name, room_capacity, ageFrom, ageTo,
   *   room_status, room_color, educators[]
   */
  async createRoom({ centerId, name, capacity, ageFrom, ageTo, status, color, educatorIds }) {
    const formData = new FormData();
    formData.append("dcenterid", String(centerId));
    formData.append("room_name", name);
    formData.append("room_capacity", String(capacity));
    formData.append("ageFrom", String(ageFrom));
    formData.append("ageTo", String(ageTo));
    formData.append("room_status", status);
    formData.append("room_color", color || "#25176F");
    if (educatorIds && educatorIds.length > 0) {
      educatorIds.forEach((id) => {
        formData.append("educators[]", String(id));
      });
    }
    const res = await api.post("/room-create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * Bulk delete rooms.
   * POST /rooms/bulk-delete  body (formData): selected_rooms[]
   */
  async bulkDeleteRooms(roomIds) {
    const formData = new FormData();
    roomIds.forEach((id) => {
      formData.append("selected_rooms[]", String(id));
    });
    const res = await api.post("/rooms/bulk-delete", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
