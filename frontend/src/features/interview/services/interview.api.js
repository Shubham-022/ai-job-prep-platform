import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_URL}/api/v1/interview`,
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

export const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {
    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("selfDescription", selfDescription)
    formData.append("jobDescription", jobDescription)

    const response = await api.post("/generate-interview-report", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return response.data;
}

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/report/${interviewId}`)
    return response.data;
}

//get all reports of logged in user
export const getAllInterviewReports = async () => {
    const response = await api.get(`/`)
    return response.data;
}

//generate resume pdf
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/resume/pdf/${interviewReportId}`, null, { responseType: "blob" })
    return response.data;
}