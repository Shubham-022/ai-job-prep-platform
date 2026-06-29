import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_URL}/api/v1/auth`,
    withCredentials: true,
});

// Attach stored token as Authorization header on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export const register = async ({ username, email, password }) => {
    try {
        const response = await api.post("/register", { username, email, password });
        // Persist token so cross-origin requests work
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (err) {
        // Re-throw so the caller (useAuth) can handle it properly
        const message = err.response?.data?.message || err.message || "Registration failed";
        throw new Error(message);
    }
};

export const login = async ({ email, password }) => {
    try {
        const response = await api.post("/login", { email, password });
        // Persist token so cross-origin requests work
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Login failed";
        throw new Error(message);
    }
};

export const logout = async () => {
    try {
        const response = await api.get("/logout");
        localStorage.removeItem("token");
        return response.data;
    } catch (err) {
        localStorage.removeItem("token");
        console.log(err);
    }
};

export const getMe = async () => {
    try {
        const response = await api.get("/get-me", { timeout: 10000 });
        return response.data;
    } catch (err) {
        console.log(err);
    }
};