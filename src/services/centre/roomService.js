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
   * Update an existing room.
   * POST /rooms/update  body (formData):
   *   id, room_name, room_capacity, ageFrom, ageTo,
   *   room_status, room_color, educators[]
   */
  async updateRoom({ id, name, capacity, ageFrom, ageTo, status, color, educatorIds }) {
    const formData = new FormData();
    formData.append("id", String(id));
    formData.append("room_name", name);
    formData.append("room_capacity", String(capacity));
    formData.append("ageFrom", String(ageFrom));
    formData.append("ageTo", String(ageTo));
    formData.append("room_status", status);
    formData.append("room_color", color || "#25176F");
    educatorIds.forEach((educatorId) => {
      formData.append("educators[]", String(educatorId));
    });
    const res = await api.post("/rooms/update", formData, {
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

  /**
   * Move selected children into another room.
   * POST /move-children  body (formData):
   *   room_id, child_ids[]
   */
  async moveChildren({ roomId, childIds }) {
    const formData = new FormData();
    formData.append("room_id", String(roomId));
    childIds.forEach((id) => formData.append("child_ids[]", String(id)));

    const res = await api.post("/move-children", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * Replace educators assigned to a room using /room/assign-staff.
   * POST /room/assign-staff body (formData):
   *   room_id, staff_ids[], removed_staff_id
   */
  async assignStaff({ roomId, staffIds, removedStaffId }) {
    const formData = new FormData();
    formData.append("room_id", String(roomId));
    if (staffIds && staffIds.length > 0) {
      staffIds.forEach((id) => formData.append("staff_ids[]", String(id)));
    }
    formData.append("removed_staff_id", removedStaffId || "");

    const res = await api.post("/room/assign-staff", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
