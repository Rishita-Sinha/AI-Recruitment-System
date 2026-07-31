import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import api from "../services/api";

function ResumeUploadBox() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload only PDF or DOCX files.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await api.post("/upload-resume", formData);

      console.log("Success Response:", res.data);

      setResponse(res.data);

    } catch (err) {
      console.error("Upload Error:", err);

      if (err.response) {
        console.error("Response:", err.response);
        setError(err.response.data.detail || "Upload failed.");
      } else if (err.request) {
        console.error("Request:", err.request);
        setError("Network Error: Request was sent but no response received.");
      } else {
        console.error("Message:", err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

      <div
        onClick={() => fileInputRef.current.click()}
        className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 transition"
      >
        <Upload className="mx-auto mb-4 text-indigo-600" size={48} />

        <h2 className="text-2xl font-semibold">
          Drag & Drop Resume
        </h2>

        <p className="text-gray-500 mt-2">
          or click here to browse
        </p>

        <p className="text-sm text-gray-400 mt-3">
          PDF • DOC • DOCX
        </p>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
      </div>

      {selectedFile && (
        <div className="mt-6 flex items-center gap-3 bg-gray-100 rounded-lg p-4">
          <FileText className="text-indigo-600" />

          <div>
            <p className="font-medium">
              {selectedFile.name}
            </p>

            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-600 font-medium">
          {error}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Resume"}
      </button>

      {response && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="text-green-700 font-semibold">
            ✅ Resume Uploaded Successfully
          </h3>

          <p className="mt-3">
            <strong>Candidate ID:</strong> {response.candidate_id}
          </p>

          <p>
            <strong>Message:</strong> {response.message}
          </p>
        </div>
      )}

    </div>
  );
}

export default ResumeUploadBox;