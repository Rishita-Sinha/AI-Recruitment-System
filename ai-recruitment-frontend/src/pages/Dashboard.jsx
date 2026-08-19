import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";

import { getDashboard } from "../services/api";

import {
  Users,
  Upload,
  Target,
  BriefcaseBusiness,
} from "lucide-react";


function Dashboard() {

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");


  // =========================================================
  // Load Dashboard
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  const loadDashboard = async () => {

    try {

      const response = await getDashboard();

      setDashboard(
        response.data
      );

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error
      );

      setError(
        "Unable to load dashboard."
      );
    }
  };


  // =========================================================
  // Loading
  // =========================================================

  if (!dashboard && !error) {

    return (
      <MainLayout>

        <div className="flex justify-center items-center h-[70vh]">

          <h1 className="text-xl font-semibold text-gray-500">
            Loading Dashboard...
          </h1>

        </div>

      </MainLayout>
    );
  }


  // =========================================================
  // Error
  // =========================================================

  if (error) {

    return (
      <MainLayout>

        <div className="flex justify-center items-center h-[70vh]">

          <div className="text-center">

            <h1 className="text-xl font-semibold text-red-500">
              {error}
            </h1>

            <button
              onClick={loadDashboard}
              className="
                mt-4
                px-5
                py-2
                rounded-lg
                bg-[#087FA8]
                text-white
                hover:bg-[#076D91]
                transition
              "
            >
              Try Again
            </button>

          </div>

        </div>

      </MainLayout>
    );
  }


  // =========================================================
  // Data
  // =========================================================

  const latestJob =
    dashboard.latest_job_matching;

  const experience =
    dashboard.experience_distribution || {};


  const experienceEntries = [
    {
      label: "Fresher",
      value: experience["Fresher"] || 0,
    },
    {
      label: "1–2 Years",
      value: experience["1–2 Years"] || 0,
    },
    {
      label: "3–5 Years",
      value: experience["3–5 Years"] || 0,
    },
    {
      label: "5+ Years",
      value: experience["5+ Years"] || 0,
    },
  ];


  const maxExperience = Math.max(
    ...experienceEntries.map(
      (item) => item.value
    ),
    1
  );


  // =========================================================
  // Dashboard UI
  // =========================================================

  return (

    <MainLayout>

      <div className="space-y-8">

        {/* =================================================
            Hero
        ================================================= */}

        <div>

          <h1 className="text-4xl font-bold text-gray-900">

            Welcome back, Recruiter 👋

          </h1>

          <p className="text-gray-500 mt-2">

            Here's an overview of your recruitment activity.

          </p>

        </div>


        {/* =================================================
            Dashboard Cards
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >

          <DashboardCard
            title="Candidates"
            value={
              dashboard.total_candidates
            }
            subtitle="Candidates in database"
            icon={Users}
            color="from-[#087FA8] to-[#08AFC5]"
          />


          <DashboardCard
            title="Uploaded Today"
            value={
              dashboard.uploaded_today
            }
            subtitle="New resumes"
            icon={Upload}
            color="from-[#08AFC5] to-[#12B8A6]"
          />


          <DashboardCard
            title="Job Matches"
            value={
              dashboard.job_matches
            }
            subtitle="Matching runs"
            icon={Target}
            color="from-[#087FA8] to-[#12B8A6]"
          />

        </div>


        {/* =================================================
            Main Dashboard Sections
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-6
          "
        >

          {/* =================================================
              Latest Job Matching
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-gray-200
              shadow-sm
              p-7
            "
          >

            <div className="flex items-center gap-3 mb-6">

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-gradient-to-br
                  from-[#087FA8]
                  to-[#08AFC5]
                  text-white
                  flex
                  items-center
                  justify-center
                "
              >
                <BriefcaseBusiness size={21} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Latest Job Matching
                </h2>

                <p className="text-sm text-gray-400">
                  Most recent candidate matching
                </p>

              </div>

            </div>


            {latestJob ? (

              <div className="space-y-5">

                {/* Job */}

                <div>

                  <p className="text-sm text-gray-400">
                    Job
                  </p>

                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {latestJob.job_title}
                  </p>

                </div>


                {/* Candidates */}

                <div>

                  <p className="text-sm text-gray-400">
                    Candidates Evaluated
                  </p>

                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {latestJob.total_candidates}
                  </p>

                </div>


                {/* Top Candidate */}

                <div
                  className="
                    bg-gray-50
                    rounded-xl
                    p-4
                    border
                    border-gray-100
                  "
                >

                  <p className="text-sm text-gray-400">
                    Top Match
                  </p>

                  <div className="flex justify-between items-center mt-1">

                    <p className="font-bold text-gray-900">
                      {latestJob.top_candidate_name || "No match"}
                    </p>

                    {latestJob.top_match_score !== null && (

                      <span
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-[#08AFC5]/10
                          text-[#087FA8]
                          text-sm
                          font-semibold
                        "
                      >
                        {latestJob.top_match_score.toFixed(2)}%
                      </span>

                    )}

                  </div>

                </div>


                {/* Date */}

                <p className="text-sm text-gray-400">

                  {latestJob.created_at
                    ? new Date(
                        latestJob.created_at
                      ).toLocaleString()
                    : ""}

                </p>

              </div>

            ) : (

              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  py-12
                  text-center
                "
              >

                <BriefcaseBusiness
                  size={40}
                  className="text-gray-300 mb-3"
                />

                <p className="font-semibold text-gray-600">
                  No job matching yet
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Submit a job description to see your latest match.
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              Candidate Experience
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-gray-200
              shadow-sm
              p-7
            "
          >

            <div className="mb-7">

              <h2 className="text-xl font-bold text-gray-900">
                Candidate Experience
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Experience distribution across candidates
              </p>

            </div>


            <div className="space-y-6">

              {experienceEntries.map(
                (item) => {

                  const percentage =
                    (item.value /
                      maxExperience) *
                    100;

                  return (

                    <div
                      key={item.label}
                    >

                      <div
                        className="
                          flex
                          justify-between
                          items-center
                          mb-2
                        "
                      >

                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          {item.value}
                        </span>

                      </div>


                      <div
                        className="
                          w-full
                          h-3
                          bg-gray-100
                          rounded-full
                          overflow-hidden
                        "
                      >

                        <div
                          className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-[#087FA8]
                            to-[#12B8A6]
                            transition-all
                            duration-500
                          "
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Dashboard;