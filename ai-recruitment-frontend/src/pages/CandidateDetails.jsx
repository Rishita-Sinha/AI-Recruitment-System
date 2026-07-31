/*
import MainLayout from "../layouts/MainLayout";

function CandidateDetails() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">Candidate Details</h1>
    </MainLayout>
  );
}

export default CandidateDetails;
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Award,
  FolderOpen,
  FileText,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import { getCandidate } from "../services/api";

function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, []);

  const fetchCandidate = async () => {
    try {
      const res = await getCandidate(id);
      setCandidate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 text-xl font-semibold">
          Loading candidate...
        </div>
      </MainLayout>
    );
  }

  if (!candidate) {
    return (
      <MainLayout>
        <div className="p-8 text-red-600 text-xl">
          Candidate not found.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      <button
        onClick={() => navigate("/candidates")}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6"
      >
        <ArrowLeft size={18} />
        Back to Candidates
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">

        {/* Profile */}

        <div className="flex items-center gap-6">

          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">

            <User
              size={42}
              className="text-indigo-600"
            />

          </div>

          <div>

            <h1 className="text-4xl font-bold">

              {candidate.name}

            </h1>

            <div className="mt-4 space-y-2">

              <div className="flex items-center gap-2">

                <Mail size={18} />

                {candidate.email}

              </div>

              <div className="flex items-center gap-2">

                <Phone size={18} />

                {candidate.phone}

              </div>

            </div>

          </div>

        </div>

        <hr className="my-8" />

        {/* Summary */}

        <h2 className="text-2xl font-bold mb-4">
          Professional Summary
        </h2>

        <p className="text-gray-700 leading-8">
          {candidate.summary}
        </p>

        <hr className="my-8" />

        {/* Education */}

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-5">

          <GraduationCap size={24} />

          Education

        </h2>

        <div className="space-y-4">

          {candidate.education?.map((edu, index) => (

            <div
              key={index}
              className="border rounded-lg p-5"
            >

              <h3 className="font-bold text-lg">

                {edu.degree}

              </h3>

              <p className="text-gray-600">

                {edu.institution}

              </p>

              <p className="text-sm text-gray-500">

                {edu.start_date} - {edu.end_date}

              </p>

            </div>

          ))}

        </div>

        <hr className="my-8" />
                {/* Experience */}

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-5">
          <Briefcase size={24} />
          Experience
        </h2>

        <div className="space-y-4">

          {candidate.experience?.length > 0 ? (

            candidate.experience.map((exp, index) => (

              <div
                key={index}
                className="border rounded-lg p-5"
              >

                <h3 className="font-bold text-lg">
                  {exp.title}
                </h3>

                <p className="text-gray-600">
                  {exp.company}
                </p>

                <p className="text-sm text-gray-500 mb-2">
                  {exp.start_date} - {exp.end_date}
                </p>

                <p className="text-gray-700">
                  {exp.description}
                </p>

              </div>

            ))

          ) : (

            <p className="text-gray-500">
              No experience available.
            </p>

          )}

        </div>

        <hr className="my-8" />

        {/* Skills */}

        <h2 className="text-2xl font-bold mb-5">
          Skills
        </h2>

        <div className="flex flex-wrap gap-3">

          {candidate.skills?.map((skill, index) => (

            <span
              key={index}
              className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium"
            >
              {skill}
            </span>

          ))}

        </div>

        <hr className="my-8" />

        {/* Projects */}

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-5">
          <FolderOpen size={24} />
          Projects
        </h2>

        <div className="space-y-4">

          {candidate.projects?.map((project, index) => (

            <div
              key={index}
              className="border rounded-lg p-5"
            >

              <h3 className="font-bold text-lg">
                {project.title}
              </h3>

              <p className="text-gray-700 mt-2">
                {project.description}
              </p>

            </div>

          ))}

        </div>

        <hr className="my-8" />

        {/* Certifications */}

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-5">
          <Award size={24} />
          Certifications
        </h2>

        <div className="flex flex-wrap gap-3">

          {candidate.certifications?.map((cert, index) => (

            <span
              key={index}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium"
            >
              {cert}
            </span>

          ))}

        </div>

        <hr className="my-8" />

        {/* Resume */}

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-5">
          <FileText size={24} />
          Resume
        </h2>

        <div className="border rounded-lg p-5">

          <p className="font-semibold">
            {candidate.resume_file}
          </p>

        </div>

      </div>

    </MainLayout>
  );
}

export default CandidateDetails;