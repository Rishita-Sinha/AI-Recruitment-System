import MainLayout from "../layouts/MainLayout";
import CandidateTable from "../components/CandidateTable";

function Candidates() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Candidates
          </h1>
          <p className="text-gray-500 mt-1">
            View and manage all uploaded candidates.
          </p>
        </div>

        <CandidateTable />
      </div>
    </MainLayout>
  );
}

export default Candidates;