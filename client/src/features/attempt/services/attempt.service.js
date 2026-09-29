import api from "../../../services/api";

export const startAttempt = async (assessmentId) => {
    const res = await api.post(`/attempts/assessments/${assessmentId}/start`);
    return res.data.data;
};

export const saveAnswer = async (attemptId, payload) => {
    const res = await api.patch(`/attempts/${attemptId}/answer`, payload);
    return res.data.data;
};

export const submitAttempt = async (attemptId) => {
    const res = await api.post(`/attempts/${attemptId}/submit`);
    return res.data.data;
};

export const startGuestAttempt = async (assessmentId, guestInfo) => {
    const res = await api.post(`/attempts/public/assessments/${assessmentId}/start`, guestInfo);
    return res.data.data; // { attempt, guestToken }
};

export const saveGuestAnswer = async (attemptId, guestToken, payload) => {
    const res = await api.patch(`/attempts/public/${attemptId}/answer`, payload, {
        headers: { "X-Guest-Token": guestToken },
    });
    return res.data.data;
};

export const submitGuestAttempt = async (attemptId, guestToken) => {
    const res = await api.post(
        `/attempts/public/${attemptId}/submit`,
        {},
        { headers: { "X-Guest-Token": guestToken } }
    );
    return res.data.data;
};

export const getAnalytics = async (assessmentId) => {
    const res = await api.get(`/attempts/assessments/${assessmentId}/analytics`);
    return res.data.data;
};

export const getLeaderboard = async (assessmentId) => {
    const res = await api.get(`/attempts/assessments/${assessmentId}/leaderboard`);
    return res.data.data;
};

export const getAttempt = async (attemptId) => {
    const res = await api.get(`/attempts/${attemptId}`);
    return res.data.data;
};

export const getGuestAttempt = async (attemptId, guestToken) => {
    const res = await api.get(`/attempts/public/${attemptId}`, {
        headers: { "X-Guest-Token": guestToken },
    });
    return res.data.data;
};

export const getAttemptReview = async (attemptId) => {
    const res = await api.get(`/attempts/${attemptId}/review`);
    return res.data.data;
};

export const getGuestAttemptReview = async (attemptId, guestToken) => {
    const res = await api.get(`/attempts/public/${attemptId}/review`, {
        headers: { "X-Guest-Token": guestToken },
    });
    return res.data.data;
};