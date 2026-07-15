import EmptyState from "../../../components/ui/EmptyState";

import LeaderboardRow from "./LeaderboardRow";

export default function LeaderboardTable({
  leaderboard = [],
}) {
  if (!leaderboard.length) {
    return (
      <EmptyState
        title="No results yet"
        description="Students have not attempted this exam."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">

      <div className="overflow-x-auto">

        <table className="min-w-[850px] w-full text-sm">

          <thead className="bg-gray-50 text-left">

            <tr>

              <th className="p-3">
                Rank
              </th>

              <th className="p-3">
                Name
              </th>

              <th className="p-3">
                Class
              </th>

              <th className="p-3">
                Roll
              </th>

              <th className="p-3">
                Attempt
              </th>

              <th className="p-3">
                Best Score
              </th>

              <th className="p-3">
                %
              </th>

            </tr>

          </thead>

          <tbody>

            {leaderboard.map((student, index) => (

              <LeaderboardRow
                key={student.student_db_id}
                student={student}
                index={index}
              />

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}