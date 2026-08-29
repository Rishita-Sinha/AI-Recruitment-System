import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  User,
} from "lucide-react";
import { getCandidates } from "../services/api";

function CandidateTable() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      const res = await getCandidates();

      setCandidates(res.data);
      setFilteredCandidates(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = search.toLowerCase();

    const filtered = candidates.filter((candidate) => {
      const name = (
        candidate.name ||
        candidate.full_name ||
        ""
      ).toLowerCase();

      const email = (
        candidate.email || ""
      ).toLowerCase();

      const skills = (
        Array.isArray(candidate.skills)
          ? candidate.skills
          : []
      )
        .join(" ")
        .toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        skills.includes(query)
      );
    });

    setFilteredCandidates(filtered);
  }, [search, candidates]);

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        Loading candidates...
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-xl p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">

      {/* =====================================================
          Header
      ===================================================== */}

      <div className="flex items-center justify-between p-6 border-b">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Candidates
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredCandidates.length} candidate(s)
          </p>
        </div>

        {/* Search */}

        <div className="relative w-80">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

      </div>


      {/* =====================================================
          Table
      ===================================================== */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-50 border-b">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Candidate
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Experience
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Skills
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Uploaded
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {filteredCandidates.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-12 text-gray-500"
                >
                  No candidates found.
                </td>

              </tr>

            ) : (

              filteredCandidates.map((candidate) => {

                const skills = Array.isArray(candidate.skills)
                  ? candidate.skills
                  : [];

                const displaySkills = skills.slice(0, 3);
                const hasMoreSkills = skills.length > 3;

                return (

                  <tr
                    key={candidate.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    {/* =================================================
                        Candidate
                    ================================================= */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">

                          <User
                            size={18}
                            className="text-indigo-600"
                          />

                        </div>

                        <div>

                          <p className="font-semibold text-gray-800">
                            {candidate.name ??
                              candidate.full_name ??
                              "-"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {candidate.email}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* =================================================
                        Experience
                    ================================================= */}

                    <td className="px-6 py-5">

                      {Array.isArray(candidate.experience) &&
                      candidate.experience.length > 0 ? (

                        <>
                          <p className="font-semibold text-gray-800">
                            {
                              candidate.experience[
                                candidate.experience.length - 1
                              ].title
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {
                              candidate.experience[
                                candidate.experience.length - 1
                              ].company
                            }
                          </p>
                        </>

                      ) : (

                        <span className="text-gray-500">
                          Fresher
                        </span>

                      )}

                    </td>


                    {/* =================================================
                        Skills
                    ================================================= */}

                    <td className="px-6 py-5">

                      <div className="flex flex-wrap gap-2">

                        {displaySkills.map((skill, index) => (

                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>

                        ))}

                        {hasMoreSkills && (

                          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                            ...
                          </span>

                        )}

                      </div>

                    </td>


                    {/* =================================================
                        Uploaded
                    ================================================= */}

                    <td className="px-6 py-5 text-gray-600">

                      {candidate.created_at
                        ? new Date(
                            candidate.created_at
                          ).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}

                    </td>


                    {/* =================================================
                        Status
                    ================================================= */}

                    <td className="px-6 py-5">

                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Active
                      </span>

                    </td>


                    {/* =================================================
                        Actions
                    ================================================= */}

                    <td className="px-6 py-5">

                      <div className="flex justify-center">

                        {/* View only */}

                        <button
                          onClick={() =>
                            navigate(
                              `/candidate/${candidate.id}`
                            )
                          }
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Eye size={16} />
                          View
                        </button>

                      </div>

                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default CandidateTable;