import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  Bot,
  Settings,
  Sparkles,
} from "lucide-react";

function Sidebar() {
  const [recruiter, setRecruiter] = useState(null);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Candidates",
      path: "/candidates",
      icon: Users,
    },
    {
      name: "Upload Resume",
      path: "/upload",
      icon: Upload,
    },
    {
      name: "Job Description",
      path: "/job-description",
      icon: FileText,
    },
    {
      name: "AI Recruiter",
      path: "/chatbot",
      icon: Bot,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  // =========================
  // Get Logged-in Recruiter
  // =========================

  useEffect(() => {
    const storedAuth =
      localStorage.getItem("auth") ||
      sessionStorage.getItem("auth");

    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);

        if (authData?.recruiter) {
          setRecruiter(authData.recruiter);
        }
      } catch (error) {
        console.error("Authentication data error:", error);
      }
    }
  }, []);

  return (
    <aside
      className="
        w-64
        h-screen
        sticky
        top-0
        flex
        flex-col
        text-white
        bg-gradient-to-b
        from-[#0B3B68]
        via-[#087FA8]
        to-[#12B8A6]
        shadow-xl
      "
    >

      {/* =========================
          Logo / Brand
      ========================= */}

      <div className="px-6 py-6 border-b border-white/15">

        <div className="flex items-center gap-3">

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-white/15
              backdrop-blur-sm
              flex
              items-center
              justify-center
              shadow-lg
            "
          >
            <Sparkles
              size={23}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AI Recruit
            </h1>

            <p className="text-xs text-white/70 mt-0.5">
              VAYS Infotech
            </p>
          </div>

        </div>

        <p className="text-xs text-white/65 mt-4 leading-relaxed">
          Intelligent recruitment platform
        </p>

      </div>


      {/* =========================
          Navigation
      ========================= */}

      <nav className="flex-1 p-4 overflow-y-auto">

        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                  group
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  mb-2
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? `
                        bg-white
                        text-[#087FA8]
                        shadow-lg
                        font-semibold
                      `
                      : `
                        text-white/85
                        hover:bg-white/10
                        hover:text-white
                        hover:translate-x-1
                      `
                  }
                `
              }
            >
              <Icon
                size={20}
                strokeWidth={2}
                className="shrink-0"
              />

              <span className="text-sm">
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>


      {/* =========================
          Recruiter Profile
      ========================= */}

      <div className="p-4 border-t border-white/15">

        <div
          className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            bg-white/10
            backdrop-blur-sm
          "
        >

          {/* Avatar */}

          <div
            className="
              w-10
              h-10
              rounded-full
              bg-white
              text-[#087FA8]
              flex
              items-center
              justify-center
              font-bold
              shadow-md
              shrink-0
            "
          >
            {recruiter?.full_name
              ? recruiter.full_name.charAt(0).toUpperCase()
              : "R"}
          </div>


          {/* Recruiter Information */}

          <div className="min-w-0">

            <p className="font-semibold text-sm truncate">
              {recruiter?.full_name || "Recruiter"}
            </p>

            <p className="text-xs text-white/60 truncate">
              {recruiter?.email || "Recruiter Account"}
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;