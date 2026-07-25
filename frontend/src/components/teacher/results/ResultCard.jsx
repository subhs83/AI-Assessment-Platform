import {
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MobileCard from "../../ui/mobile/MobileCard";
import MobileStatusBadge from "../../ui/mobile/MobileStatusBadge";

export default function ResultCard({
  result,
  examUid,
  routes,
}) {
  const navigate = useNavigate();

  const completed = !result.auto_submitted_reason;

  return (
    <MobileCard
      onClick={() =>
        navigate(
          routes.exams.studentAttempts(
            examUid,
            result.student_id
          )
        )
      }
    >

      {/* Header */}

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0 flex-1">

          <h3 className="truncate text-base font-semibold text-slate-900">
            {result.first_name} {result.last_name}
          </h3>

          <p className="mt-0.5 text-sm text-slate-500">
            {result.class_section || "-"}
            {" • "}
            Roll {result.roll_number || "-"}
          </p>

        </div>


        <MobileStatusBadge
          color={completed ? "green" : "red"}
        >
          {completed
            ? "Completed"
            : "Auto Submitted"}
        </MobileStatusBadge>

      </div>


      {/* Score */}

      <div className="mt-3 flex items-center justify-between">

        <div>

          <div className="text-2xl font-bold text-slate-900">
            {result.score} / {result.total_marks}
          </div>

          <div className="text-xs text-slate-500">
            Score
          </div>

        </div>


        <div className="text-right">

          <div className="text-2xl font-bold text-indigo-600">
            {(result.percentage || 0).toFixed(2)}%
          </div>

          <div className="text-xs text-slate-500">
            Percentage
          </div>

        </div>

      </div>


      {/* Footer */}

      <div className="mt-3 flex items-center justify-between border-t pt-3">

        <div className="flex items-center gap-4 text-sm text-slate-600">

          <span>
            Attempts:
            <strong className="ml-1 text-slate-900">
              {result.attempts_count}
            </strong>
          </span>


          <span className="flex items-center gap-1">

            <ShieldAlert size={15} />

            <strong className="text-slate-900">
              {result.violation_count || 0}
            </strong>

          </span>

        </div>


        <ChevronRight
          size={18}
          className="text-slate-400"
        />

      </div>

    </MobileCard>
  );
}