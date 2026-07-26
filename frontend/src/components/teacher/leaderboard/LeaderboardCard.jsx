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

      {/* Rank */}

      <div className="flex justify-center">

        <div
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            px-5
            py-2
            text-lg
            font-bold
            ${rankBg}
          `}
        >
          <Trophy size={18} />
          {rank}
        </div>

      </div>

      {/* Student */}

      <div className="mt-4 text-center">

        <h3 className="text-lg font-semibold text-slate-900">
          {student.first_name} {student.last_name}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {student.class_section || "-"}
          {" • "}
          Roll {student.roll_number || "-"}
        </p>

      </div>

      {/* Performance */}

      <div className="mt-5 flex items-end justify-between border-t pt-4">

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

      <div className="mt-4 flex items-center justify-center border-t pt-3">

        <div className="text-sm text-slate-600">
          Attempts
          <span className="ml-1 font-semibold">
            {student.attempts_count || "-"}
          </span>
        </div>

      </div>

    </MobileCard>
  );
}