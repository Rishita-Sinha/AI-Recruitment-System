import { useEffect, useState } from "react";
import {
  LogOut,
} from "lucide-react";

function Navbar() {
  const [recruiter, setRecruiter] = useState(null);

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

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("auth");
    sessionStorage.removeItem("auth");

    window.location.href = "/login";
  };

  return (
    <header
      className="
        h-16
        bg-white
        border-b
        border-gray-200
        flex
        items-center
        justify-between
        px-6
        sticky
        top-0
        z-40
      "
    >

      {/* =========================
          Left Section
      ========================= */}

      <div>

        <h2
          className="
            text-xl
            font-bold
            bg-gradient-to-r
            from-[#087FA8]
            via-[#08AFC5]
            to-[#12B8A6]
            bg-clip-text
            text-transparent
          "
        >
          AI Recruitment Platform
        </h2>

        <p className="text-xs text-gray-400 mt-0.5">
          Intelligent Resume Screening System
        </p>

      </div>


      {/* =========================
          Right Section
      ========================= */}

      <div className="flex items-center gap-4">

        {/* =========================
            Recruiter Profile
        ========================= */}

        <div className="flex items-center gap-3">

          {/* Avatar */}

          <div
            className="
              w-10
              h-10
              rounded-full
              bg-gradient-to-br
              from-[#087FA8]
              to-[#12B8A6]
              text-white
              flex
              items-center
              justify-center
              font-bold
              shadow-sm
            "
          >
            {recruiter?.full_name
              ? recruiter.full_name.charAt(0).toUpperCase()
              : "R"}
          </div>


          {/* Recruiter Details */}

          <div className="hidden md:block">

            <p className="text-sm font-semibold text-gray-800">
              {recruiter?.full_name || "Recruiter"}
            </p>

            <p className="text-xs text-gray-400">
              {recruiter?.email || "Recruiter Account"}
            </p>

          </div>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              ml-1
              p-2
              rounded-lg
              text-gray-400
              hover:text-red-500
              hover:bg-red-50
              transition-all
              duration-200
            "
            title="Logout"
          >
            <LogOut size={18} />
          </button>

        </div>

      </div>

    </header>
  );
}

export default Navbar;