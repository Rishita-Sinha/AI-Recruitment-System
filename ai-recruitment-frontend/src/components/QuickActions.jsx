import { Upload, FileText, Bot } from "lucide-react";

function QuickActions() {

    return (

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-semibold mb-6">
                Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <button className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-5 transition">

                    <Upload />

                    Upload Resume

                </button>

                <button className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-xl p-5 transition">

                    <FileText />

                    Analyze Job Description

                </button>

                <button className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-5 transition">

                    <Bot />

                    AI Recruiter

                </button>

            </div>

        </div>

    );

}

export default QuickActions;