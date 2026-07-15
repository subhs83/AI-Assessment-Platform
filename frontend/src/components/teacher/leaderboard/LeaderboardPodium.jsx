// src/components/teacher/leaderboard/LeaderboardPodium.jsx

import {
  Trophy,
  Medal,
  Award,
} from "lucide-react";

export default function LeaderboardPodium({
  leaderboard,
}) {
  if (leaderboard.length < 3) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 items-end gap-4">

      {/* Second */}
      <div className="flex h-40 flex-col justify-center rounded-lg border bg-gray-50 p-4 text-center">

        <Medal
          size={32}
          className="mx-auto mb-2 text-gray-500"
        />

        <div className="font-semibold">
          {leaderboard[1].first_name}{" "}
          {leaderboard[1].last_name}
        </div>

        <div className="mt-1 text-sm text-gray-500">
          {leaderboard[1].percentage?.toFixed(2)}%
        </div>

      </div>

      {/* Champion */}
      <div className="flex h-56 flex-col justify-center rounded-lg border-2 border-yellow-300 bg-yellow-50 p-5 text-center shadow-md">

        <Trophy
          size={40}
          className="mx-auto mb-2 text-yellow-600"
        />

        <div className="text-xs uppercase tracking-wide text-yellow-700">
          Champion
        </div>

        <div className="mt-1 text-lg font-bold">
          {leaderboard[0].first_name}{" "}
          {leaderboard[0].last_name}
        </div>

        <div className="mt-2 text-3xl font-bold text-yellow-700">
          {leaderboard[0].percentage?.toFixed(2)}%
        </div>

        <div className="text-sm text-gray-500">
          {leaderboard[0].score} / {leaderboard[0].total_marks}
        </div>

      </div>

      {/* Third */}
      <div className="flex h-32 flex-col justify-center rounded-lg border bg-orange-50 p-4 text-center">

        <Award
          size={32}
          className="mx-auto mb-2 text-orange-500"
        />

        <div className="font-semibold">
          {leaderboard[2].first_name}{" "}
          {leaderboard[2].last_name}
        </div>

        <div className="mt-1 text-sm text-gray-500">
          {leaderboard[2].percentage?.toFixed(2)}%
        </div>

      </div>

    </div>
  );
}