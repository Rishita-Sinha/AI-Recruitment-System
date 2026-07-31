import { Bell, Search, UserCircle } from "lucide-react";

function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          AI Resume Screening System
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search Box */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Notification */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell size={22} />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <UserCircle size={32} className="text-gray-600" />
          <div className="hidden md:block">
            <p className="text-sm font-medium">Rishita</p>
            <p className="text-xs text-gray-500">Recruiter</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;