import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function CandidateRanking() {
  const location = useLocation();
  const navigate = useNavigate();
  const candidates = location.state?.candidates || [];

  const [expandedSummaries, setExpandedSummaries] = useState({});

  const toggleSummary = (id) => {
    setExpandedSummaries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getInitials = (name) => {
    if (!name) return "?";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getMatchColor = (score) => {
    if (score >= 90)
      return {
        text: "text-green-700",
        bar: "bg-green-500",
      };

    if (score >= 75)
      return {
        text: "text-blue-700",
        bar: "bg-blue-500",
      };

    if (score >= 50)
      return {
        text: "text-yellow-700",
        bar: "bg-yellow-500",
      };

    return {
      text: "text-red-700",
      bar: "bg-red-500",
    };
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">

          <h1 className="text-4xl font-bold text-gray-800">
            Candidate Ranking
          </h1>

          <p className="text-gray-500 mt-2">
            AI ranked candidates based on the submitted job description.
          </p>

        </div>

        {candidates.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-12 text-center">

            <h2 className="text-2xl font-semibold text-gray-700">
              No Candidates Found
            </h2>

            <p className="text-gray-500 mt-3">
              Try another Job Description.
            </p>

          </div>

        ) : (

          <div className="space-y-8">

            {candidates.map((candidate, index) => {

              const match = getMatchColor(candidate.match_score);

              return (

                <div
                  key={candidate.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100"
                >

                  <div className="p-8">

                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">

                      <div className="flex gap-6">

                        <div
                          className="
                            w-20
                            h-20
                            rounded-full
                            bg-indigo-600
                            text-white
                            flex
                            items-center
                            justify-center
                            text-2xl
                            font-bold
                            shrink-0
                          "
                        >
                          {getInitials(candidate.name)}
                        </div>

                        <div>

                          <div className="flex items-center gap-3">

                            <h2 className="text-2xl font-bold text-gray-800">
                                {candidate.name}
                            </h2>

                          </div>

                          <p className="text-gray-500 mt-1">
                            Rank #{index + 1}
                          </p>

                          <div className="mt-5 space-y-2">

                            <p>
                              <span className="font-semibold">
                                Email:
                              </span>{" "}
                              {candidate.email || "Not Available"}
                            </p>

                            <p>
                              <span className="font-semibold">
                                Phone:
                              </span>{" "}
                              {candidate.phone || "Not Available"}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="w-full lg:w-80">

                        <div className="flex justify-between mb-2">

                          <span className="font-semibold">
                            Match Score
                          </span>

                          <span className={`font-bold ${match.text}`}>
                            {candidate.match_score}%
                          </span>

                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-4">

                          <div
                            className={`${match.bar} h-4 rounded-full transition-all duration-700`}
                            style={{
                              width: `${candidate.match_score}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    <hr className="my-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      <div>

                        <h3 className="font-bold text-lg mb-3">
                          Professional Summary
                        </h3>

                        <div className="bg-gray-50 rounded-xl p-5">

                          {candidate.summary ? (
                            <>

                              <p className="text-gray-700 leading-8 text-[15px]">

                                {expandedSummaries[candidate.id]
                                  ? candidate.summary
                                  : candidate.summary.length > 220
                                  ? `${candidate.summary.slice(0, 220)}...`
                                  : candidate.summary}

                              </p>

                              {candidate.summary.length > 220 && (

                                <button
                                  onClick={() =>
                                    toggleSummary(candidate.id)
                                  }
                                  className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                  {expandedSummaries[candidate.id]
                                    ? "Show Less"
                                    : "Read More"}
                                </button>

                              )}

                            </>
                          ) : (

                            <p className="text-gray-500">
                              No summary available.
                            </p>

                          )}

                        </div>

                      </div>

                      <div>

                        <h3 className="font-bold text-lg mb-3">
                          Matched Skills
                        </h3>

                        <div className="flex flex-wrap gap-3">
                                                    {candidate.matched_skills &&
                          candidate.matched_skills.length > 0 ? (

                            candidate.matched_skills.map((skill) => (

                              <span
                                key={skill}
                                className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium text-sm"
                              >
                                {skill}
                              </span>

                            ))

                          ) : (

                            <span className="text-red-500">
                              No matched skills found.
                            </span>

                          )}

                        </div>

                        {candidate.candidate_skills &&
                          candidate.candidate_skills.length > 0 && (

                            <>

                              <h4 className="font-semibold mt-6 mb-3">
                                All Candidate Skills
                              </h4>

                              <div className="flex flex-wrap gap-2">

                                {candidate.candidate_skills.map((skill) => (

                                  <span
                                    key={skill}
                                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                                  >
                                    {skill}
                                  </span>

                                ))}

                              </div>

                            </>

                        )}

                      </div>

                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">

                      <button
                        onClick={() =>
                          navigate("/candidate-profile", {
                             state: {
                                candidate,
                              },
                          })
                        }
                        className="
                            px-5
                            py-2.5
                            rounded-lg
                            bg-indigo-600
                            hover:bg-indigo-700
                            text-white
                            font-semibold
                            transition
                        "
                      >
                        View Profile
                      </button>

                      <button
                        className="
                          px-5
                          py-2.5
                          rounded-lg
                          border
                          border-indigo-600
                          text-indigo-600
                          hover:bg-indigo-50
                          font-semibold
                          transition
                        "
                      >
                        View Resume
                      </button>

                      <button
                        className="
                          px-5
                          py-2.5
                          rounded-lg
                          bg-emerald-600
                          hover:bg-emerald-700
                          text-white
                          font-semibold
                          transition
                        "
                      >
                        Ask AI
                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </MainLayout>

  );
}

export default CandidateRanking;