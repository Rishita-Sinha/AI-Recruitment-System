import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  Bot,
  Settings,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Candidates", path: "/candidates", icon: Users },
    { name: "Upload Resume", path: "/upload", icon: Upload },
    { name: "Job Description", path: "/job-description", icon: FileText },
    { name: "AI Recruiter", path: "/chatbot", icon: Bot },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">AI Recruit</h1>
        <p className="text-sm text-slate-400">
          Resume Screening System
        </p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                  isActive
                    ? "bg-indigo-600"
                    : "hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="font-medium">Rishita</p>
        <p className="text-sm text-slate-400">Recruiter</p>
      </div>
    </aside>
  );
}

export default Sidebar;