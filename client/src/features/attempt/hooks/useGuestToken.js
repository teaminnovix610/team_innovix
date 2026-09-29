const tokenKey = (attemptId) => `guestToken:${attemptId}`;

export const saveGuestToken = (attemptId, token) => {
    sessionStorage.setItem(tokenKey(attemptId), token);
};

export const getGuestToken = (attemptId) => {
    return sessionStorage.getItem(tokenKey(attemptId));
};