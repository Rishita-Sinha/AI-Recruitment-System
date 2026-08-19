import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { matchJob } from "../services/api";

function JobDescription() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    experience: "",
    skills: "",
    qualification: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await matchJob(formData);

      console.log(response.data);

      navigate("/candidate-ranking", {
        state: {
          candidates: response.data.ranked_candidates,
        },
      });

    } catch (error) {
      console.error(error);
      alert("Failed to find candidates.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Job Description
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-xl p-8 space-y-6"
        >
          <div>
            <label className="block font-semibold mb-2">
              Job Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Experience Required
            </label>

            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="3+ Years"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Required Skills
            </label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Python, FastAPI, SQL, Docker"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">
              Required Qualification
            </label>

            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="B.Tech Computer Science, MCA, MBA..."
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">
              Preferred Location
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Guwahati, Bangalore, Remote..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Job Description
            </label>

            <textarea
              rows="10"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Paste the complete job description here..."
              required
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Find Candidates
          </button>

        </form>

      </div>
    </MainLayout>
  );
}

export default JobDescription;