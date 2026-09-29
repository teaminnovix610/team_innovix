import api from "../../../services/api";

export const createAssessment = async (data) => {
    const res = await api.post("/assessments", data);
    return res.data.data;
};

export const addQuestion = async (assessmentId, data) => {
    const res = await api.post(`/assessments/${assessmentId}/questions`, data);
    return res.data.data;
};

export const publishAssessment = async (assessmentId) => {
    const res = await api.patch(`/assessments/${assessmentId}/publish`);
    return res.data.data;
};

export const getAssessmentsForBatch = async (batchId) => {
    const res = await api.get(`/assessments/batch/${batchId}`);
    return res.data.data;
};

export const getAssessment = async (assessmentId) => {
    const res = await api.get(`/assessments/${assessmentId}`);
    return res.data.data;
};

export const getMyAssessments = async () => {
    const res = await api.get("/assessments/mine");
    return res.data.data;
};

export const getAssessmentsForStudent = async () => {
    const res = await api.get("/assessments/student");
    return res.data.data;
};

export const updateQuestion = async (assessmentId, questionId, data) => {
    const res = await api.patch(`/assessments/${assessmentId}/questions/${questionId}`, data);
    return res.data.data;
};

export const deleteQuestion = async (assessmentId, questionId) => {
    const res = await api.delete(`/assessments/${assessmentId}/questions/${questionId}`);
    return res.data.data;
};