import { Upload } from "lucide-react";

function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      <h2 className="text-xl font-semibold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.map((activity, index) => (

          <div
            key={index}
            className="flex items-center gap-4"
          >

            <div className="bg-green-100 p-2 rounded-full">

              <Upload
                size={18}
                className="text-green-600"
              />

            </div>

            <p>{activity.title}</p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default RecentActivity;