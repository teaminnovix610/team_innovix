import api from "@/services/api";

export const getProfile = async () => {
    const res = await api.get("/profile/me");
    return res.data.data;
};

export const updateProfile = async (data) => {
    const res = await api.patch("/profile", data);
    return res.data.data;
};