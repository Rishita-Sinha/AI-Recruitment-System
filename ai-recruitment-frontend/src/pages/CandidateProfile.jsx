import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  createInterview,
  getInterviewResults,
} from "../services/api";

function CandidateProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const candidate = location.state?.candidate;
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [interviewResults, setInterviewResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const generateInterviewLink = async () => {
  setInterviewLoading(true);
  setInterviewError("");
  setInterviewLink("");

  try {
    const jobMatchId = candidate.job_match_id;

    if (!jobMatchId) {
      setInterviewError(
        "Job information is missing for this candidate."
      );
      return;
    }

    const response = await createInterview(
      candidate.id,
      jobMatchId
    );

    const token = response.data.token;
    const newInterviewId = response.data.interview_id;

    setInterviewId(newInterviewId);

    const link = `${window.location.origin}/interview/${token}`;

    setInterviewLink(link);
  } catch (error) {
    console.error("Interview creation error:", error);

    setInterviewError(
      error.response?.data?.detail ||
      "Failed to generate interview link."
    );
  } finally {
    setInterviewLoading(false);
  }
};
    const loadInterviewResults = async (interviewId) => {
  setResultsLoading(true);
  setResultsError("");

  try {
    const response = await getInterviewResults(interviewId);

    setInterviewResults(response.data);
  } catch (error) {
    console.error(
      "Error loading interview results:",
      error
    );

    setResultsError(
      error.response?.data?.detail ||
      "Unable to load interview results."
    );
  } finally {
    setResultsLoading(false);
  }
};

  if (!candidate) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto py-20 text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Candidate Not Found
          </h1>

          <p className="text-gray-500 mt-4">
            No candidate data was received.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-8 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  const initials = candidate.name
    ? candidate.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "?";

  const resumeURL = candidate.resume_file
    ? `http://localhost:8000/uploads/${encodeURIComponent(
        candidate.resume_file
      )}`
    : null;

  const matchColor = (score) => {
    if (score >= 90)
      return {
        text: "text-green-700",
        bg: "bg-green-500",
      };

    if (score >= 75)
      return {
        text: "text-blue-700",
        bg: "bg-blue-500",
      };

    if (score >= 50)
      return {
        text: "text-yellow-700",
        bg: "bg-yellow-500",
      };

    return {
      text: "text-red-700",
      bg: "bg-red-500",
    };
  };

  const color = matchColor(candidate.match_score || 0);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}

        <button
          onClick={() => navigate(-1)}
          className="
            mb-8
            flex
            items-center
            gap-2
            text-indigo-600
            hover:text-indigo-800
            font-semibold
          "
        >
          ← Back to Ranking
        </button>

        {/* Profile Card */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            border-gray-100
            overflow-hidden
          "
        >

          {/* Top Banner */}

          <div className="h-36 bg-gradient-to-r from-indigo-600 to-blue-600" />

          <div className="px-10 pb-10">

            <div className="flex flex-col lg:flex-row lg:justify-between">

              {/* Left */}

              <div className="-mt-16 flex gap-6">

                <div
                  className="
                    w-32
                    h-32
                    rounded-full
                    bg-indigo-600
                    border-8
                    border-white
                    flex
                    items-center
                    justify-center
                    text-white
                    text-4xl
                    font-bold
                    shadow-lg
                  "
                >
                  {initials}
                </div>

                <div className="pt-20">

                  <h1 className="text-4xl font-bold text-gray-800">
                    {candidate.name}
                  </h1>

                  <p className="text-gray-500 mt-2">
                    AI Ranked Candidate
                  </p>

                  <div className="flex flex-wrap gap-4 mt-6">

                    <span className="text-gray-700">
                      📧 {candidate.email || "Not Available"}
                    </span>

                    <span className="text-gray-700">
                      📞 {candidate.phone || "Not Available"}
                    </span>

                  </div>

                </div>

              </div>

              {/* Match Score */}

              <div className="mt-10 lg:mt-12 lg:w-72">

                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">

                  <p className="font-semibold text-gray-600">
                    Match Score
                  </p>

                  <h2
                    className={`text-5xl font-bold mt-3 ${color.text}`}
                  >
                    {candidate.match_score || 0}%
                  </h2>

                  <div className="w-full bg-gray-200 rounded-full h-4 mt-6">

                    <div
                      className={`${color.bg} h-4 rounded-full`}
                      style={{
                        width: `${candidate.match_score || 0}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="mt-6 flex flex-col gap-3">

                  {resumeURL && (
                    <a
                      href={resumeURL}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        text-center
                        bg-indigo-600
                        hover:bg-indigo-700
                        text-white
                        py-3
                        rounded-xl
                        font-semibold
                      "
                    >
                      View Resume
                    </a>
                  )}

                  {resumeURL && (
                    <a
                      href={resumeURL}
                      download
                      className="
                        text-center
                        border
                        border-indigo-600
                        text-indigo-600
                        hover:bg-indigo-50
                        py-3
                        rounded-xl
                        font-semibold
                      "
                    >
                      Download Resume
                    </a>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Summary */}

        <div className="mt-10 bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-5">
            Professional Summary
          </h2>

          <p className="text-gray-700 leading-8">
            {candidate.summary || "No summary available."}
          </p>

        </div>
                {/* Skills */}

        <div className="mt-10">
            

          {/* Matched Skills */}

          <div className="bg-white rounded-2xl shadow p-8">

            <h2 className="text-2xl font-bold mb-6">
              Matched Skills
            </h2>

            {candidate.matched_skills &&
            candidate.matched_skills.length > 0 ? (

              <div className="flex flex-wrap gap-3">

                {candidate.matched_skills.map((skill) => (

                  <span
                    key={skill}
                    className="
                      px-4
                      py-2
                      rounded-full
                      bg-green-100
                      text-green-700
                      font-medium
                    "
                  >
                    {skill}
                  </span>

                ))}

              </div>

            ) : (

              <p className="text-gray-500">
                No matched skills available.
              </p>

            )}

          </div>
          </div>
        
        

          

            

             

        

        

        {/* Experience */}

        <div className="mt-10 bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-8">
            Experience
          </h2>

          {candidate.experience &&
          candidate.experience.length > 0 ? (

            <div className="space-y-8">

              {candidate.experience.map((exp, index) => (

                <div
                  key={index}
                  className="
                    border-l-4
                    border-green-500
                    pl-6
                  "
                >

                  <h3 className="text-xl font-bold">
                    {exp.title}
                  </h3>

                  <p className="text-green-700 font-semibold mt-1">
                    {exp.company}
                  </p>

                  <p className="text-gray-500 mt-2">
                    {exp.start_date} - {exp.end_date || "Present"}
                  </p>

                  <p className="text-gray-700 leading-7 mt-4">
                    {exp.description}
                  </p>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No experience available.
            </p>

          )}

        </div>
                {/* Projects */}

        <div className="mt-10 bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-8">
            Projects
          </h2>

          {candidate.projects &&
          candidate.projects.length > 0 ? (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {candidate.projects.map((project, index) => (

                <div
                  key={index}
                  className="
                    border
                    rounded-2xl
                    p-6
                    hover:shadow-lg
                    transition
                    duration-300
                  "
                >

                  <h3 className="text-xl font-bold text-gray-800">
                    {project.title}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    {project.start_date}
                    {project.end_date
                      ? ` - ${project.end_date}`
                      : ""}
                  </p>

                  <p className="text-gray-700 leading-7 mt-5">
                    {project.description}
                  </p>

                  {project.technologies &&
                    project.technologies.length > 0 && (

                      <div className="mt-6 flex flex-wrap gap-2">

                        {project.technologies.map((tech) => (

                          <span
                            key={tech}
                            className="
                              px-3
                              py-1
                              rounded-full
                              bg-indigo-100
                              text-indigo-700
                              text-sm
                              font-medium
                            "
                          >
                            {tech}
                          </span>

                        ))}

                      </div>

                  )}

                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No projects available.
            </p>

          )}

        </div>

        {/* Action Buttons */}

        <div className="mt-10 flex flex-wrap gap-4 justify-center">

          <button
            onClick={() => navigate(-1)}
            className="
              px-6
              py-3
              rounded-xl
              border
              border-gray-300
              hover:bg-gray-100
              font-semibold
            "
          >
            Back
          </button>

          {resumeURL && (

            <a
              href={resumeURL}
              target="_blank"
              rel="noreferrer"
              className="
                px-6
                py-3
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                font-semibold
              "
            >
              View Resume
            </a>

          )}

          {resumeURL && (

            <a
              href={resumeURL}
              download
              className="
                px-6
                py-3
                rounded-xl
                border
                border-indigo-600
                text-indigo-600
                hover:bg-indigo-50
                font-semibold
              "
            >
              Download Resume
            </a>

          )}

          <button
            onClick={generateInterviewLink}
            disabled={interviewLoading}
            className="
              px-6
              py-3
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              font-semibold
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {interviewLoading
              ? "Generating..."
              : "Generate Interview Link"}
          </button>

        </div>

                {/* Interview Link Result */}

        {interviewError && (
          <div className="mt-6 text-center text-red-600 font-semibold">
            {interviewError}
          </div>
        )}

        {interviewLink && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="font-semibold text-green-700 mb-3">
              Interview link generated successfully!
            </p>

            <div className="flex gap-3 justify-center">
              <input
                type="text"
                value={interviewLink}
                readOnly
                className="w-full max-w-xl px-4 py-3 border rounded-lg bg-white"
              />

              <button
                onClick={() =>
                  navigator.clipboard.writeText(interviewLink)
                }
                className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                Copy
              </button>
            </div>

            <button
              onClick={() => window.open(interviewLink, "_blank")}
              className="mt-4 px-5 py-3 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              Open Interview
            </button>

            {interviewId && (
              <button
                onClick={() => loadInterviewResults(interviewId)}
                disabled={resultsLoading}
                className="mt-4 ml-3 px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resultsLoading ? "Loading Results..." : "View Interview Results"}
              </button>
            )}
          </div>
        )}

        {/* Interview Results */}

        {resultsError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 font-semibold">
            {resultsError}
          </div>
        )}

        {interviewResults && (
          <div className="mt-10 space-y-6">

            <div className="bg-white rounded-2xl shadow p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Interview Results
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {interviewResults.candidate?.name || candidate.name}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    interviewResults.interview?.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {interviewResults.interview?.status || "Unknown"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-2xl font-bold mb-5">
                AI Interview Summary
              </h2>

              <div className="whitespace-pre-wrap text-gray-700 leading-8">
                {interviewResults.interview?.summary || "Summary not available yet."}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">
                Candidate Answers
              </h2>

              {interviewResults.answers?.length > 0 ? (
                <div className="space-y-6">
                  {interviewResults.answers.map((item) => (
                    <div
                      key={item.question_number}
                      className="border rounded-2xl p-6"
                    >
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        Question {item.question_number}
                      </h3>

                      <p className="font-semibold text-gray-800 leading-7 mb-4">
                        {item.question}
                      </p>

                      <div className="bg-gray-50 rounded-xl p-5">
                        <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No interview answers are available.
                </p>
              )}
            </div>

          </div>
        )}

        {/* Footer */}

        <div className="py-12" />

      </div>

    </MainLayout>
  );
}

export default CandidateProfile;