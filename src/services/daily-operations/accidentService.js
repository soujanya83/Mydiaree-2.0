import api from "@/api/api";

export const accidentService = {
  getAccidentList: (data) => api.post("/Accidents/mernlist", data),
  getAccidentDetails: (id) => api.get(`/accidents/${id}`),
  saveAccident: (data) => api.post("/accidents/save", data),
  deleteAccident: (data) => api.post("/Accidents/delete", data),
  downloadPdf: (id) =>
    api.post("/Accidents/downloadPdf", null, {
      params: { id },
      responseType: "blob",
    }),
  sendEmail: (id, studentId) => {
    const formData = new FormData();
    formData.append("id", String(id));
    formData.append("student_id", String(studentId));
    return api.post("/Accidents/sendEmail", formData);
  },
};
