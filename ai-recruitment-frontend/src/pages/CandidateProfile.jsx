import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function CandidateProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const candidate = location.state?.candidate;

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
            className="
              px-6
              py-3
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              font-semibold
            "
          >
            Ask AI Recruiter
          </button>

        </div>

        {/* Footer */}

        <div className="py-12" />

      </div>

    </MainLayout>
  );
}

export default CandidateProfile;