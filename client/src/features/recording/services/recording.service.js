import api from "@/services/api";

export const createRecording = async (data) => {

    const res = await api.post(
        "/recordings",
        data
    );

    return res.data.data;
};

export const getBatchRecordings = async (batchId) => {

    const res = await api.get(
        `/recordings/batch/${batchId}`
    );

    return res.data.data;
};

export const getRecordingById = async (id) => {

    const res = await api.get(
        `/recordings/${id}`
    );

    return res.data.data;
};

export const updateRecording = async (id, data) => {

    const res = await api.patch(
        `/recordings/${id}`,
        data
    );

    return res.data.data;
};

export const deleteRecording = async (id) => {

    const res = await api.delete(
        `/recordings/${id}`
    );

    return res.data.data;
};
export const getStudentRecordings = async () => {

    const res = await api.get(
        "/recordings/student"
    );

    return res.data.data;
};