import api from "../../../services/api";

export const getPublicWeeklyTest = async () => {
    const res = await api.get("/assessments/public/weekly-test");
    return res.data.data;
};

export const getPublicAssessmentDetail = async (assessmentId) => {
    const res = await api.get(`/assessments/public/${assessmentId}`);
    return res.data.data;
};

export const getPublicWeeklyTests = async (classLevel) => {
    const res = await api.get("/assessments/public/weekly-tests", {
        params: { classLevel },
    });
    return res.data.data;
};
export const lookupGuestReview = async (assessmentId, phone) => {
    const res = await api.get(`/attempts/public/assessments/${assessmentId}/review-lookup`, {
        params: { phone },
    });
    return res.data.data;
};

export const getGuestResultsList = async (phone) => {
    const res = await api.get("/attempts/public/guest-results", {
        params: { phone },
    });
    return res.data.data;
};