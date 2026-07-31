import MainLayout from "../layouts/MainLayout";
import ResumeUploadBox from "../components/ResumeUploadBox";

function UploadResume() {
  return (
    <MainLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold">
            Upload Resume
          </h1>

          <p className="text-gray-500 mt-2">
            Upload candidate resumes for AI-powered parsing and storage.
          </p>
        </div>

        <ResumeUploadBox />

      </div>
    </MainLayout>
  );
}

export default UploadResume;