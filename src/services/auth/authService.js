import api from "../../api/api";

export const authService = {
  async login(payload) {
    const res = await api.post("/login", payload);
    //console.log(res.data);
    return res.data;
  },

  async sendForgotPasswordOtp(formData) {
    const res = await api.post("/forget-password", formData);
    return res.data;
  },

  async verifyForgotPasswordOtp(formData) {
    const res = await api.post("/verify-otp", formData);
    return res.data;
  },

  async resendForgotPasswordOtp(formData) {
    const res = await api.post("/resend-otp", formData);
    return res.data;
  },

  async resetPassword(formData) {
    const res = await api.post("/reset-password-update", formData);
    return res.data;
  },
};
