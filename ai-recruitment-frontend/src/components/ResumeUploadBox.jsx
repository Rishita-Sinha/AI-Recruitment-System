import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";

function ResumeUploadBox() {
  const fileInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // Allowed File Types
  // =========================================================

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx"];

  // =========================================================
  // Handle File Selection
  // =========================================================

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) {
      return;
    }

    setError("");
    setResponse(null);

    const fileArray = Array.from(files);

    // Maximum 20 files
    if (fileArray.length > 20) {
      setError(
        "You can upload a maximum of 20 resumes at a time."
      );

      return;
    }

    // Validate files
    const invalidFiles = fileArray.filter((file) => {
      const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      return (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(extension)
      );
    });

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file type: ${invalidFiles
          .map((file) => file.name)
          .join(", ")}. Please upload only PDF, DOC, or DOCX files.`
      );

      return;
    }

    setSelectedFiles(fileArray);
  };

  // =========================================================
  // Remove Individual File
  // =========================================================

  const removeFile = (index) => {
    setSelectedFiles((previousFiles) =>
      previousFiles.filter((_, i) => i !== index)
    );
  };

  // =========================================================
  // Clear All Files
  // =========================================================

  const clearFiles = () => {
    setSelectedFiles([]);
    setResponse(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // Upload Resumes
  // =========================================================

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await api.post(
        "/upload-resumes",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Batch Upload Response:", res.data);

      setResponse(res.data);

      // Clear selected files after successful request
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Batch Upload Error:", err);

      if (err.response) {
        console.error(
          "Backend Response:",
          err.response.data
        );

        setError(
          err.response.data?.detail ||
          "Batch upload failed."
        );
      } else if (err.request) {
        setError(
          "Network Error: Request was sent but no response was received."
        );
      } else {
        setError(
          err.message || "Something went wrong."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Page
  // =========================================================

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

      {/* =====================================================
          Upload Area
      ===================================================== */}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="
          border-2
          border-dashed
          border-indigo-300
          rounded-xl
          p-12
          text-center
          cursor-pointer
          hover:border-indigo-500
          transition
        "
      >

        <Upload
          className="mx-auto mb-4 text-indigo-600"
          size={48}
        />

        <h2 className="text-2xl font-semibold">
          Upload Resumes
        </h2>

        <p className="text-gray-500 mt-2">
          Select multiple resumes at once
        </p>

        <p className="text-sm text-gray-400 mt-3">
          PDF • DOC • DOCX
        </p>

        <p className="text-sm text-indigo-600 font-medium mt-2">
          Maximum 20 resumes per batch
        </p>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) =>
            handleFileSelect(e.target.files)
          }
        />

      </div>

      {/* =====================================================
          Selected Files
      ===================================================== */}

      {selectedFiles.length > 0 && (
        <div className="mt-6">

          <div className="flex justify-between items-center mb-4">

            <h3 className="font-semibold text-lg">
              Selected Resumes ({selectedFiles.length})
            </h3>

            <button
              type="button"
              onClick={clearFiles}
              className="
                text-red-600
                hover:text-red-800
                text-sm
                font-medium
              "
            >
              Clear All
            </button>

          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">

            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="
                  flex
                  items-center
                  justify-between
                  bg-gray-100
                  rounded-lg
                  p-4
                "
              >

                <div className="flex items-center gap-3">

                  <FileText
                    className="text-indigo-600"
                    size={24}
                  />

                  <div>

                    <p className="font-medium">
                      {file.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="
                    text-gray-400
                    hover:text-red-600
                  "
                >
                  <X size={20} />
                </button>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* =====================================================
          Error
      ===================================================== */}

      {error && (
        <div
          className="
            mt-6
            bg-red-50
            border
            border-red-200
            rounded-xl
            p-4
            flex
            items-start
            gap-3
          "
        >

          <AlertCircle
            className="text-red-600 mt-0.5"
            size={22}
          />

          <p className="text-red-600 font-medium">
            {error}
          </p>

        </div>
      )}

      {/* =====================================================
          Upload Button
      ===================================================== */}

      <button
        onClick={handleUpload}
        disabled={
          loading ||
          selectedFiles.length === 0
        }
        className="
          mt-6
          w-full
          bg-indigo-600
          hover:bg-indigo-700
          text-white
          py-3
          rounded-xl
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
          font-semibold
        "
      >
        {loading
          ? `Processing ${selectedFiles.length} Resumes...`
          : `Upload ${
              selectedFiles.length > 0
                ? selectedFiles.length
                : ""
            } Resume${
              selectedFiles.length === 1
                ? ""
                : "s"
            }`}
      </button>

      {/* =====================================================
          Upload Results
      ===================================================== */}

      {response && (
        <div
          className="
            mt-6
            bg-green-50
            border
            border-green-200
            rounded-xl
            p-5
          "
        >

          <div className="flex items-center gap-2">

            <CheckCircle
              className="text-green-600"
              size={24}
            />

            <h3 className="text-green-700 font-semibold text-lg">
              Batch Upload Completed
            </h3>

          </div>

          <div className="mt-4 space-y-2">

            <p>
              <strong>Total Files:</strong>{" "}
              {response.total}
            </p>

            <p className="text-green-700">
              <strong>Successfully Uploaded:</strong>{" "}
              {response.successful}
            </p>

            <p className="text-red-600">
              <strong>Failed:</strong>{" "}
              {response.failed}
            </p>

          </div>

          {/* Successful Files */}

          {response.successful_files?.length > 0 && (
            <div className="mt-5">

              <h4 className="font-semibold text-green-700 mb-2">
                Successfully Uploaded
              </h4>

              <div className="space-y-1">

                {response.successful_files.map(
                  (file, index) => (
                    <p
                      key={index}
                      className="text-sm text-gray-700"
                    >
                      ✅ {file.filename}
                    </p>
                  )
                )}

              </div>

            </div>
          )}

          {/* Failed Files */}

          {response.failed_files?.length > 0 && (
            <div className="mt-5">

              <h4 className="font-semibold text-red-700 mb-2">
                Failed Files
              </h4>

              <div className="space-y-2">

                {response.failed_files.map(
                  (file, index) => (
                    <div
                      key={index}
                      className="
                        bg-red-100
                        rounded-lg
                        p-3
                      "
                    >

                      <p className="font-medium text-red-700">
                        ❌ {file.filename}
                      </p>

                      <p className="text-sm text-red-600 mt-1">
                        {file.error}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default ResumeUploadBox;