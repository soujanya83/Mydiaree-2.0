import api from "@/api/api";

export const sleepChecksService = {
  getSleepChecks: (params) => api.get("/sleepcheck/list", { params }),
  saveSleepCheck: (data) => api.post("/sleepcheck/save", data),
  updateSleepCheck: (data) => api.post("/sleepcheck/update", data),
  deleteSleepCheck: (data) => api.post("/sleepcheck/delete", data),
};
