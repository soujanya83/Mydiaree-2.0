import api from "../../api/api";

export const getFormOptions = async () => {
    const response = await api.get("/re-enrollment/form-options");
    return response.data;
};
