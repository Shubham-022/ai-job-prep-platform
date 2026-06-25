import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1/auth",
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