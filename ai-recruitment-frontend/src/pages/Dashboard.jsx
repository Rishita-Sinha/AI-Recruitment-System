import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import RecentCandidates from "../components/RecentCandidates";
import RecentActivity from "../components/RecentActivity";

import { getDashboard } from "../services/api";

import {
  Users,
  Upload,
  Bot,
  CheckCircle,
} from "lucide-react";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  };

  if (!dashboard) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <h1 className="text-2xl font-semibold text-gray-600">
            Loading Dashboard...
          </h1>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">

        {/* Hero Section */}

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              Welcome back, Recruiter 👋
            </h1>

            

          </div>

        </div>

        {/* Dashboard Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <DashboardCard
            title="Total Candidates"
            value={dashboard.total_candidates}
            subtitle="Candidates in database"
            icon={Users}
            color="bg-blue-600"
          />

          <DashboardCard
            title="Uploaded Today"
            value={dashboard.uploaded_today}
            subtitle="New resumes"
            icon={Upload}
            color="bg-green-600"
          />

          <DashboardCard
            title="Recent Uploads"
            value={dashboard.recent_candidates.length}
            subtitle="Latest resumes"
            icon={Bot}
            color="bg-purple-600"
          />

          <DashboardCard
            title="Recent Activity"
            value={dashboard.recent_activity.length}
            subtitle="Latest events"
            icon={CheckCircle}
            color="bg-orange-500"
          />

        </div>

        {/* Bottom Section */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <RecentCandidates
            candidates={dashboard.recent_candidates}
          />

          <RecentActivity
            activities={dashboard.recent_activity}
          />

        </div>

      </div>
    </MainLayout>
  );
}

export default Dashboard;