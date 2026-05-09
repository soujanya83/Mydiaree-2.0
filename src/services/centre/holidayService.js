import api from "../../api/api";

export const holidayService = {
  // 1. List of all the Public holidays
  // method: get, url: /getholidays, params: month (number)
  getHolidays: async (month) => {
    try {
      const response = await api.get("/getholidays", {
        params: { month },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching holidays:", error);
      throw error;
    }
  },

  // 2. Delete Holidays
  // method: delete, url: /deleteholidays/{id}
  deleteHoliday: async (id) => {
    try {
      const response = await api.delete(`/deleteholidays/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting holiday:", error);
      throw error;
    }
  },

  // 3. Bulk delete
  // method: post, url: /bulkdeleteholidays, body: json { "ids": [...] }
  bulkDeleteHolidays: async (ids) => {
    try {
      const response = await api.post("/bulkdeleteholidays", { ids });
      return response.data;
    } catch (error) {
      console.error("Error bulk deleting holidays:", error);
      throw error;
    }
  },

  // 4. Create/Update Holidays
  // method: post, url: /createholidays, body formData
  saveHoliday: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await api.post("/createholidays", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving holiday:", error);
      throw error;
    }
  },
};
