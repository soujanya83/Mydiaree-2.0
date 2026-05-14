import api from "../../api/api";

export const getFormOptions = async () => {
    const response = await api.get("/re-enrollment/form-options");
    return response.data;
};

export const sendReEnrollmentEmail = async (formData) => {
    const response = await api.post("/re-enrollment/send-email", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};
