import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Resume Upload
export const uploadResume = (formData) =>
  api.post("/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Candidates
export const getCandidates = () => api.get("/candidates");

export const getCandidate = (id) =>
  api.get(`/candidates/${id}`);

export const updateCandidate = (id, data) =>
  api.put(`/candidates/${id}`, data);

export const deleteCandidate = (id) =>
  api.delete(`/candidates/${id}`);

// Job Description
export const matchJob = (data) =>
  api.post("/jobs/match", data);

// AI Recruiter Chat
export const askRecruiterAI = (question) =>
  api.post("/chat", {
    question,
  });
  // Dashboard
export const getDashboard = () =>
  api.get("/dashboard");

export default api;
