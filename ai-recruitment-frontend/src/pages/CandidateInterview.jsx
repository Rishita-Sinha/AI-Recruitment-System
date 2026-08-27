import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function CandidateInterview() {
  const { token } = useParams();

  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // Load Interview
  // =========================================================

  useEffect(() => {
    loadInterview();
  }, [token]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/interviews/${token}`);

      setInterview(response.data);

      // If interview was already completed
      if (response.data.status === "completed") {
        setCompleted(true);
      }

    } catch (err) {
      console.error("Error loading interview:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load this interview. The interview link may be invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Start Interview
  // =========================================================

  const startInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        `/interviews/${token}/start`
      );

      setInterview((prev) => ({
        ...prev,
        status: response.data.status,
      }));

      setQuestion(response.data.question);

      setStarted(true);

    } catch (err) {
      console.error("Error starting interview:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to start the interview."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Submit Answer
  // =========================================================

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(
        `/interviews/${token}/answer`,
        {
          answer: answer,
        }
      );

      // Interview completed
      if (response.data.completed) {
        setCompleted(true);
        setStarted(false);
        setAnswer("");
        return;
      }

      // Move to next question
      setQuestion(response.data.question);

      setAnswer("");

    } catch (err) {
      console.error("Error submitting answer:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Loading Screen
  // =========================================================

  if (loading && !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">
            Loading interview...
          </div>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Error Screen
  // =========================================================

  if (error && !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Interview Unavailable
          </h1>

          <p className="text-gray-600 mt-3">
            {error}
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // Completed Screen
  // =========================================================

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-xl w-full text-center">

          <div className="text-6xl mb-5">
            ✅
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Interview Completed
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            Thank you for completing your interview.
          </p>

          <p className="text-gray-500 mt-2">
            Your responses have been successfully submitted.
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // Interview Information / Start Screen
  // =========================================================

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-10">

          {/* Header */}

          <div className="text-center">

            <div className="text-5xl mb-4">
              💼
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              AI Interview
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome to your interview
            </p>

          </div>

          {/* Candidate Information */}

          <div className="mt-8 bg-gray-50 rounded-xl p-6">

            <div className="mb-5">

              <p className="text-sm text-gray-500">
                Candidate
              </p>

              <p className="text-lg font-semibold text-gray-800">
                {interview?.candidate_name}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Position
              </p>

              <p className="text-lg font-semibold text-gray-800">
                {interview?.job_title}
              </p>

            </div>

          </div>

          {/* Instructions */}

          <div className="mt-8">

            <h2 className="text-lg font-semibold text-gray-800">
              Interview Instructions
            </h2>

            <ul className="mt-4 space-y-3 text-gray-600">

              <li>
                • The interview consists of 8 questions.
              </li>

              <li>
                • Read each question carefully before answering.
              </li>

              <li>
                • Type your answer in the text box provided.
              </li>

              <li>
                • Submit your answer to continue to the next question.
              </li>

              <li>
                • Make sure your answers are clear and complete.
              </li>

            </ul>

          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Start Button */}

          <button
            onClick={startInterview}
            disabled={loading}
            className="
              mt-8
              w-full
              py-3
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-700
              disabled:bg-gray-400
              text-white
              font-semibold
              transition
            "
          >
            {loading ? "Starting..." : "Start Interview"}
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // Interview Question Screen
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}

      <header className="bg-white border-b">

        <div className="max-w-4xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-xl font-bold text-gray-800">
                AI Interview
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {interview?.job_title}
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm text-gray-500">
                Candidate
              </p>

              <p className="font-semibold text-gray-800">
                {interview?.candidate_name}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* Main */}

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Progress */}

        <div className="mb-8">

          <div className="flex justify-between text-sm text-gray-500 mb-2">

            <span>
              Question
            </span>

            <span>
              Please answer carefully
            </span>

          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">

            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{
                width: `${(
                  (interview?.current_question / 8) *
                  100
                )}%`,
              }}
            />

          </div>

        </div>

        {/* Question Card */}

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <div className="flex items-start gap-4">

            <div className="
              flex
              items-center
              justify-center
              w-10
              h-10
              rounded-full
              bg-indigo-100
              text-indigo-700
              font-bold
              flex-shrink-0
            ">
              ?
            </div>

            <div>

              <p className="text-sm text-indigo-600 font-semibold mb-2">
                Interview Question
              </p>

              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {question}
              </h2>

            </div>

          </div>

          {/* Answer */}

          <div className="mt-8">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Answer
            </label>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              disabled={submitting}
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                p-4
                text-gray-800
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
                focus:border-transparent
              "
            />

            <div className="flex justify-between items-center mt-3">

              <p className="text-sm text-gray-400">
                Take your time and provide a clear answer.
              </p>

              <p className="text-sm text-gray-400">
                {answer.length} characters
              </p>

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            onClick={submitAnswer}
            disabled={submitting || !answer.trim()}
            className="
              mt-6
              w-full
              py-3
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-700
              disabled:bg-gray-300
              disabled:cursor-not-allowed
              text-white
              font-semibold
              transition
            "
          >
            {submitting
              ? "Submitting..."
              : "Submit Answer"}
          </button>

        </div>

      </main>

    </div>
  );
}

export default CandidateInterview;