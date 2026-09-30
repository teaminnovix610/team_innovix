import api from "../../../services/api";

export const getMyBatches = async () => {
    const res = await api.get("/batches/my");
    return res.data.data;
};

export const createBatch = async (data) => {
    const endpoint = data.teacherId ? "/batches/assigned-course" : "/batches";
    const res = await api.post(endpoint, data);
    return res.data.data;
};

export const getBatchStudents = async (batchId) => {
    const res = await api.get(`/batches/${batchId}/students`);
    return res.data.data;
};

export const getBatch = async (batchId) => {

    const res = await api.get(
        `/batches/${batchId}`
    );

    return res.data.data;

};

export const getBatches = async () => {
  const response = await api.get("/batches");
  return response.data.data;
};

export const getStudentBatches = async () => {
    const res = await api.get("/batches/student");
    return res.data.data;
};

export const deleteBatch = async (batchId) => {
    const res = await api.delete(`/batches/${batchId}`);
    return res.data;
};
