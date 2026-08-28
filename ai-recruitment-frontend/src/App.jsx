import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import Candidates from "./pages/Candidates";
import CandidateDetails from "./pages/CandidateDetails";
import EditCandidate from "./pages/EditCandidate";
import JobDescription from "./pages/JobDescription";
import CandidateRanking from "./pages/CandidateRanking";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateInterview from "./pages/CandidateInterview";
import Chatbot from "./pages/Chatbot";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ========================================
          PUBLIC ROUTES
      ======================================== */}

      {/* First page when opening the application */}
      <Route path="/" element={<Signup />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Signup */}
      <Route path="/signup" element={<Signup />} />

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Reset Password */}
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* ========================================
          PUBLIC CANDIDATE INTERVIEW
      ======================================== */}

      <Route
        path="/interview/:token"
        element={<CandidateInterview />}
      />


      {/* ========================================
          PROTECTED ROUTES
      ======================================== */}

      {/* Dashboard */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* Resume Upload */}

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadResume />
          </ProtectedRoute>
        }
      />


      {/* Candidates */}

      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <Candidates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/:id"
        element={
          <ProtectedRoute>
            <CandidateDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/edit/:id"
        element={
          <ProtectedRoute>
            <EditCandidate />
          </ProtectedRoute>
        }
      />


      {/* Job Description */}

      <Route
        path="/job-description"
        element={
          <ProtectedRoute>
            <JobDescription />
          </ProtectedRoute>
        }
      />


      {/* Candidate Ranking */}

      <Route
        path="/candidate-ranking"
        element={
          <ProtectedRoute>
            <CandidateRanking />
          </ProtectedRoute>
        }
      />


      {/* Candidate Profile */}

      <Route
        path="/candidate-profile"
        element={
          <ProtectedRoute>
            <CandidateProfile />
          </ProtectedRoute>
        }
      />


      {/* AI Recruiter / Chatbot */}

      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />


      {/* Settings */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;