import axios from "axios";
import { API } from "../constants/api";

const api = axios.create({
    baseURL: API.BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let refreshSubscribers = [];

// New: lets AuthContext subscribe to "the session is definitively dead" events,
// without api.js needing to import React or AuthContext (keeps this file framework-agnostic).
let sessionExpiredHandlers = [];

export function registerSessionExpiredHandler(handler) {
    sessionExpiredHandlers.push(handler);
    return () => {
        sessionExpiredHandlers = sessionExpiredHandlers.filter((h) => h !== handler);
    };
}

function notifySessionExpired() {
    sessionExpiredHandlers.forEach((handler) => handler());
}

// Each subscriber is { onSuccess, onFailure } so a request that queued up
// waiting for an in-flight refresh can be rejected (not just left hanging
// forever) if that refresh turns out to fail — see onRefreshFailed below.
function subscribeTokenRefresh(onSuccess, onFailure) {
    refreshSubscribers.push({ onSuccess, onFailure });
}

function onRefreshed() {
    refreshSubscribers.forEach(({ onSuccess }) => onSuccess());
    refreshSubscribers = [];
}

function onRefreshFailed(err) {
    refreshSubscribers.forEach(({ onFailure }) => onFailure(err));
    refreshSubscribers = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isRefreshCall = originalRequest.url.includes("/auth/refresh");
        const isLoginCall = originalRequest.url.includes("/auth/login");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshCall &&
            !isLoginCall
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    await axios.post(
                        `${API.BASE_URL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    isRefreshing = false;
                    onRefreshed();

                    return api(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;

                    // Reject any requests that queued up waiting on this
                    // refresh — previously these were just dropped
                    // (refreshSubscribers = []) with nothing ever calling
                    // resolve() or reject() on their promises, so they'd
                    // hang forever instead of failing cleanly. Now they
                    // reject with the same error the refresh itself hit,
                    // so callers' .catch()/try-catch actually run.
                    onRefreshFailed(refreshError);

                    // Session is definitively dead — tell AuthContext so `user` clears
                    // and ProtectedRoute redirects to /login on the next render.
                    notifySessionExpired();

                    return Promise.reject(refreshError);
                }
            }

            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(
                    () => resolve(api(originalRequest)),
                    (err) => reject(err)
                );
            });
        }

        return Promise.reject(error);
    }
);

export default api;