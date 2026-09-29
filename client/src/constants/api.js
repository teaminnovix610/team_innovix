export const API = {
    BASE_URL: import.meta.env.PROD
        ? "/api/v1"
        : "http://localhost:5000/api/v1",
};