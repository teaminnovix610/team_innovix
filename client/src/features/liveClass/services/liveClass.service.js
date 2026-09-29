import api from "@/services/api";

export const createLiveClass = async (data) => {

    const res = await api.post(
        "/live-classes",
        data
    );

    return res.data.data;
};

export const getMyClasses = async () => {

    const res = await api.get(
        "/live-classes/my"
    );

    return res.data.data;
};

export const getBatchClasses = async (batchId) => {

    const res = await api.get(
        `/live-classes/batch/${batchId}`
    );

    return res.data.data;
};

export const getStudentClasses = async () => {

    const res = await api.get(
        "/live-classes/student"
    );

    return res.data.data;
};

export const getJoinToken = async (liveClassId, device = "main") => {

    const res = await api.get(
        `/live-classes/${liveClassId}/join`,
        { params: { device } }
    );

    return res.data.data;
};

export const endLiveClass = async (liveClassId) => {
    const res = await api.post(`/live-classes/${liveClassId}/end`);
    return res.data.data;
};

export const getAllClasses = async () => {
    const res = await api.get("/live-classes");
    return res.data.data;
};