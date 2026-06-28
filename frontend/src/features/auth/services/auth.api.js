import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_URL}/api/v1/auth`,
    withCredentials: true,
});

export const register = async ({ username, email, password }) => {
    try {
        const response = await api.post("/register", { username, email, password });
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
     return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Login failed";
        throw new Error(message);
    }
};

export const logout =async()=>{

    try{
        const response=await api.get("/logout")
        return response.data;
    }catch(err){
        console.log(err)
    }
}

export const getMe=async()=>{
    try{
        const response=await api.get("/get-me")
        return response.data;
    }catch(err){
        console.log(err)
    }
};