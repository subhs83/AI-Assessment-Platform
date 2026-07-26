import { Trophy } from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function LeaderboardCard({
  student,
  index,
}) {
  const rank =
    index === 0
      ? "🥇"
      : index === 1
      ? "🥈"
      : index === 2
      ? "🥉"
      : `#${index + 1}`;

  const rankBg =
    index === 0
      ? "bg-yellow-100 text-yellow-700"
      : index === 1
      ? "bg-slate-100 text-slate-700"
      : index === 2
      ? "bg-orange-100 text-orange-700"
      : "bg-indigo-100 text-indigo-700";

  return (
    <MobileCard>

      {/* Header */}

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">

            <div
              className={`rounded-full px-3 py-1 text-sm font-semibold ${rankBg}`}
            >
              {rank}
            </div>

            <h3 className="truncate text-base font-semibold text-slate-900">
              {student.first_name} {student.last_name}
            </h3>

          </div>

          <p className="mt-2 text-sm text-slate-500">
            {student.class_section || "-"}
            {" • "}
            Roll {student.roll_number || "-"}
          </p>

        </div>

        <Trophy
          size={22}
          className="text-amber-500"
        />

      </div>

      {/* Performance */}

      <div className="mt-4 flex items-end justify-between">

        <div>

          <div className="text-2xl font-bold text-green-600">
            {student.score} / {student.total_marks}
          </div>

          <div className="text-xs text-slate-500">
            Best Score
          </div>

        </div>

        <div className="text-right">

          <div className="text-2xl font-bold text-indigo-600">
            {(student.percentage || 0).toFixed(2)}%
          </div>

          <div className="text-xs text-slate-500">
            Percentage
          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-4 flex items-center justify-between border-t pt-3">

        <div className="text-sm text-slate-600">
          Attempts:
          <span className="ml-1 font-semibold">
            {student.attempts_count || "-"}
          </span>
        </div>

        <div className="text-xs font-medium text-indigo-600">
          Rank #{index + 1}
        </div>

      </div>

    </MobileCard>
  );
}