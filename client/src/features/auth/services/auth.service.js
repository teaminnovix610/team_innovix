import api from "../../../services/api";

export const login = async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data.data;
};

export const register = async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data.data;
};

export const me = async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

export const forgotPassword = async (data) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
};

export const verifyOtp = async (data) => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data.data;
};

export const resetPassword = async (data) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
};