import api from "../../../services/api";

export const getDashboard = async () => {
    const response = await api.get("/dashboard");
    return response.data.data;
};