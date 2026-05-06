import api from "@/api/api";

export const accidentService = {
  getAccidentList: (data) => api.post("/Accidents/list", data),
  getAccidentDetails: (data) => api.post("/Accidents/details", data),
};
