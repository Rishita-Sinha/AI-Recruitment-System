function RecentCandidates({ candidates }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">
        Recent Candidates
      </h2>

      <div className="space-y-4">

        {candidates.map((candidate) => (

          <div
            key={candidate.id}
            className="flex justify-between items-center border-b pb-3 last:border-none"
          >

            <div>

              <h3 className="font-semibold">
                {candidate.name}
              </h3>

              <p className="text-gray-500 text-sm">

                {candidate.skills && candidate.skills.length > 0
                  ? candidate.skills.slice(0, 3).join(", ")
                  : "No skills available"}

              </p>

            </div>

            <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">

              {candidate.experience &&
              candidate.experience.length > 0
                ? `${candidate.experience.length} Experience`
                : "Fresher"}

            </span>

          </div>

        ))}

      </div>
    </div>
  );
}

export default RecentCandidates;