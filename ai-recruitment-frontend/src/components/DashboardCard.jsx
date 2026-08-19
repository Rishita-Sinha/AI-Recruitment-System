import { ArrowUpRight } from "lucide-react";

function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "from-[#087FA8] to-[#08AFC5]",
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-6
        shadow-sm
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      <div className="flex justify-between items-start">

        {/* Content */}

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            {subtitle}
          </p>

        </div>


        {/* Icon */}

        <div
          className={`
            bg-gradient-to-br
            ${color}
            p-3.5
            rounded-xl
            text-white
            shadow-sm
          `}
        >
          <Icon size={22} />
        </div>

      </div>


      {/* Updated */}

      <div className="flex items-center mt-5 text-[#08AFC5] text-sm font-medium">

        <ArrowUpRight size={16} />

        <span className="ml-1">
          Updated today
        </span>

      </div>

    </div>
  );
}

export default DashboardCard;