import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});


// =========================================================
// JWT TOKEN HELPER
// =========================================================

const getAuthToken = () => {
  const storedAuth =
    localStorage.getItem("auth") ||
    sessionStorage.getItem("auth");

  if (!storedAuth) {
    return null;
  }

  try {
    const authData = JSON.parse(storedAuth);

    return authData?.access_token || null;
  } catch (error) {
    console.error("Authentication data error:", error);
    return null;
  }
};


// =========================================================
// AXIOS REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// AXIOS RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    // If backend says token is invalid/expired
    if (error.response?.status === 401) {

      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


// =========================================================
// RESUME UPLOAD
// =========================================================

export const uploadResume = (formData) =>
  api.post("/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


// =========================================================
// CANDIDATES
// =========================================================

export const getCandidates = () =>
  api.get("/candidates");

export const getCandidate = (id) =>
  api.get(`/candidates/${id}`);

export const updateCandidate = (id, data) =>
  api.put(`/candidates/${id}`, data);

export const deleteCandidate = (id) =>
  api.delete(`/candidates/${id}`);


// =========================================================
// JOB DESCRIPTION
// =========================================================

export const matchJob = (data) =>
  api.post("/jobs/match", data);


// =========================================================
// AI RECRUITER CHAT
// =========================================================

export const askRecruiterAI = (question) =>
  api.post("/chat", {
    question,
  });


// =========================================================
// DASHBOARD
// =========================================================

export const getDashboard = () =>
  api.get("/dashboard");


export default api;