import api from "@/api/api";

export const accidentService = {
  getAccidentList: (data) => api.post("/Accidents/mernlist", data),
  getAccidentDetails: (data) => api.post("/Accidents/details", data),
  saveAccident: (data) => api.post("/Accident/saveAccident", data),
  deleteAccident: (data) => api.post("/Accidents/delete", data),
};
