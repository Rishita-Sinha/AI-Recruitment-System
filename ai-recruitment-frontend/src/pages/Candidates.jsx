import MainLayout from "../layouts/MainLayout";
import CandidateTable from "../components/CandidateTable";
import api from "../services/api";

function Candidates() {

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get(
        "/candidates/export-excel",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "candidate_resume_data.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Failed to download candidate Excel:",
        error
      );

      alert(
        "Unable to download candidate data. Please try again."
      );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Candidates
            </h1>

            <p className="text-gray-500 mt-1">
              View and manage all uploaded candidates.
            </p>
          </div>

          <button
            onClick={handleDownloadExcel}
            className="px-5 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition"
          >
            Download Excel
          </button>

        </div>

        <CandidateTable />

      </div>
    </MainLayout>
  );
}

export default Candidates;