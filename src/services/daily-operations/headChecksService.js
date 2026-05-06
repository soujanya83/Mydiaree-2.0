import api from "@/api/api";

export const headChecksService = {
  getHeadChecks: (params) => api.get("/headChecks", { params }),
  storeHeadChecks: (data) => api.post("/headchecks/store", data),
  deleteHeadCheck: (data) => api.post("/headcheckdelete", data),
};
