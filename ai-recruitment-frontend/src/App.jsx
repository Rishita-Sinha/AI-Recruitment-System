import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import Candidates from "./pages/Candidates";
import CandidateDetails from "./pages/CandidateDetails";
import EditCandidate from "./pages/EditCandidate";
import JobDescription from "./pages/JobDescription";
import CandidateRanking from "./pages/CandidateRanking";
import CandidateProfile from "./pages/CandidateProfile";
import Chatbot from "./pages/Chatbot";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Resume Upload */}
      <Route path="/upload" element={<UploadResume />} />

      {/* Candidates */}
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/candidate/:id" element={<CandidateDetails />} />
      <Route path="/candidate/edit/:id" element={<EditCandidate />} />

      {/* Job Description */}
      <Route
        path="/job-description"
        element={<JobDescription />}
      />

      {/* Candidate Ranking */}
      <Route
        path="/candidate-ranking"
        element={<CandidateRanking />}
      />

      {/* Candidate Profile */}
      <Route
        path="/candidate-profile"
        element={<CandidateProfile />}
      />

      {/* AI Recruiter */}
      <Route path="/chatbot" element={<Chatbot />} />

      {/* Settings */}
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;