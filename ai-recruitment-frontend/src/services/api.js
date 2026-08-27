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
// BATCH RESUME UPLOAD
// =========================================================

export const uploadResumes = (formData) =>
  api.post("/upload-resumes", formData, {
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
// CANDIDATE AI INTERVIEW
// =========================================================

// Get interview details using the public token
export const getInterview = (token) =>
  api.get(`/interviews/${token}`);


// Start the interview
export const startInterview = (token) =>
  api.post(`/interviews/${token}/start`);


// Submit candidate answer
export const submitInterviewAnswer = (token, answer) =>
  api.post(`/interviews/${token}/answer`, {
    answer,
  });


// Create a new candidate interview
export const createInterview = (candidateId, jobMatchId) =>
  api.post("/interviews/create", null, {
    params: {
      candidate_id: candidateId,
      job_match_id: jobMatchId,
    },
  });


// Get completed interview results
export const getInterviewResults = (interviewId) =>
  api.get(`/interviews/${interviewId}/results`);


// =========================================================
// DASHBOARD
// =========================================================

export const getDashboard = () =>
  api.get("/dashboard");


// =========================================================
// LLM CONFIGURATION
// =========================================================

export const getLLMConfigs = () =>
  api.get("/llm/configs");

export const createLLMConfig = (data) =>
  api.post("/llm/configs", data);

export const activateLLMConfig = (id) =>
  api.put(`/llm/configs/${id}/activate`);


// =========================================================
// EXPORT API
// =========================================================

export default api;