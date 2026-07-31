import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  getCandidate,
  updateCandidate,
} from "../services/api";

function EditCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: [],
  });

  useEffect(() => {
    fetchCandidate();
  }, []);

  const fetchCandidate = async () => {
    try {
      const res = await getCandidate(id);

      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        summary: res.data.summary || "",
        skills: Array.isArray(res.data.skills)
          ? res.data.skills
          : [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;

    setFormData({
      ...formData,
      skills: updatedSkills,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateCandidate(id, formData);

      alert("Candidate updated successfully!");

      navigate("/candidates");
    } catch (err) {
      console.error(err);

      alert("Failed to update candidate.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 text-xl">
          Loading...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      <h1 className="text-3xl font-bold mb-8">
        Edit Candidate
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-8 space-y-6"
      >

        {/* Name */}

        <div>
          <label className="block font-semibold mb-2">
            Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Email */}

        <div>
          <label className="block font-semibold mb-2">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Phone */}

        <div>
          <label className="block font-semibold mb-2">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Professional Summary */}

        <div>
          <label className="block font-semibold mb-2">
            Professional Summary
          </label>

          <textarea
            rows={6}
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Skills */}

        <div>

          <label className="block text-xl font-semibold mb-4">
            Skills
          </label>

          {formData.skills.length > 0 ? (

            <div className="space-y-4">

              {formData.skills.map((skill, index) => (

                <div key={index}>

                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Skill {index + 1}
                  </label>

                  <input
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      handleSkillChange(index, e.target.value)
                    }
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                </div>

              ))}

            </div>

          ) : (

            <div className="border rounded-lg p-4 text-gray-500 bg-gray-50">
              No skills extracted from this resume.
            </div>

          )}

        </div>

        {/* Buttons */}

        <div className="flex gap-4 pt-4">

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => navigate("/candidates")}
            className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

        </div>

      </form>

    </MainLayout>
  );
}

export default EditCandidate;