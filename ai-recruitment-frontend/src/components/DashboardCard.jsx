import { ArrowUpRight } from "lucide-react";

function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "bg-indigo-600",
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            {subtitle}
          </p>
        </div>

        <div className={`${color} p-3 rounded-xl text-white`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="flex items-center mt-4 text-green-600 text-sm">
        <ArrowUpRight size={16} />
        <span className="ml-1">Updated today</span>
      </div>
    </div>
  );
}

export default DashboardCard;