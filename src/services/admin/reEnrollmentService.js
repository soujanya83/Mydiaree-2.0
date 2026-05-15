import api from "../../api/api";
export const reEnrollmentService = {
  getFilteredSubmissions: async (filters) => {
    const formData = new FormData();
    if (filters.search) formData.append("search", filters.search);
    if (filters.session_option && filters.session_option !== "all") 
      formData.append("session_option", filters.session_option);
    if (filters.kinder_program && filters.kinder_program !== "all") 
      formData.append("kinder_program", filters.kinder_program);
    if (filters.date_from) formData.append("date_from", filters.date_from);
    if (filters.date_to) formData.append("date_to", filters.date_to);
    if (filters.page) formData.append("page", filters.page);
    if (filters.per_page) formData.append("per_page", filters.per_page);

    const res = await api.post("/re-enrollment/filter", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getMetadata: async () => {
    // Assuming the endpoint is /re-enrollment/meta based on common patterns
    const res = await api.get("/re-enrollment/form");
    return res.data;
  },

  printSubmission: async (id) => {
    const res = await api.get(`/re-enrollment/print/${id}`, {
      responseType: "blob",
    });
    return res.data;
  },
};
