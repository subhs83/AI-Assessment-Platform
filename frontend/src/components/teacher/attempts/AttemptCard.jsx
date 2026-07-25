import {
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MobileCard from "../../ui/mobile/MobileCard";
import MobileStatusBadge from "../../ui/mobile/MobileStatusBadge";

export default function AttemptCard({
  attempt,
  routes,
}) {
  const navigate = useNavigate();

  const status = attempt.auto_submitted_reason
    ? "Auto Submitted"
    : "Normal";

  const statusColor = attempt.auto_submitted_reason
    ? "red"
    : "green";


  return (
    <MobileCard
      onClick={() =>
        navigate(
          routes.attemptDetail(attempt.id)
        )
      }
    >

      {/* Header */}

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-base font-semibold text-slate-900">
            Attempt #{attempt.attempt_number}
          </h3>

          {attempt.is_best && (
            <p className="mt-1 text-xs font-medium text-green-600">
              Best Performance
            </p>
          )}

        </div>


        <MobileStatusBadge color={statusColor}>
          {status}
        </MobileStatusBadge>

      </div>


      {/* Main Score */}

      <div className="mt-4 flex items-center justify-between">

        <div>

          <p className="text-3xl font-bold text-indigo-600">
            {(attempt.percentage || 0).toFixed(2)}%
          </p>

          <p className="text-xs text-slate-500">
            Percentage
          </p>

        </div>


        <div className="text-right">

          <p className="text-lg font-semibold text-slate-900">
            {attempt.score} / {attempt.total_marks}
          </p>

          <p className="text-xs text-slate-500">
            Score
          </p>

        </div>

      </div>


      {/* Details */}

      <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">

        <div>

          <p className="text-xs text-slate-500">
            Violations
          </p>

          <p className="flex items-center gap-1 font-semibold text-slate-900">

            <ShieldAlert size={15}/>

            {attempt.violation_count || 0}

          </p>

        </div>


        <div>

          <p className="text-xs text-slate-500">
            Status
          </p>

          <p className="font-semibold text-slate-900">
            {attempt.auto_submitted_reason
              ? "Auto"
              : "Completed"}
          </p>

        </div>

      </div>


      {/* Footer */}

      <div className="mt-4 flex items-center justify-between border-t pt-3">

        <div className="text-xs text-slate-500">

          {attempt.start_time}

        </div>


        <ChevronRight
          size={18}
          className="text-slate-400"
        />

      </div>


    </MobileCard>
  );
}