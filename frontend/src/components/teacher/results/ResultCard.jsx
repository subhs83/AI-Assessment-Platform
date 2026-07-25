import { ChevronRight, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import MobileCard from "../../ui/mobile/MobileCard";
import MobileStatusBadge from "../../ui/mobile/MobileStatusBadge";

export default function ResultCard({
  result,
  examUid,
  routes,
}) {
  const statusColor = result.auto_submitted_reason
    ? "yellow"
    : "green";

  const statusText = result.auto_submitted_reason
    ? "Auto Submitted"
    : "Submitted";

  return (
    <MobileCard>

      {/* Header */}

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0 flex-1">

          <h3 className="truncate text-base font-semibold text-slate-900">
            {result.first_name} {result.last_name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {result.class_name}
            {result.section_name
              ? ` - ${result.section_name}`
              : ""}
            {" • "}
            Roll {result.roll_number || "-"}
          </p>

        </div>

        <MobileStatusBadge color={statusColor}>
          {statusText}
        </MobileStatusBadge>

      </div>

      {/* Score */}

      <div className="mt-4 grid grid-cols-2 gap-4">

        <div>

          <div className="text-xs uppercase tracking-wide text-slate-500">
            Score
          </div>

          <div className="mt-1 text-lg font-bold text-slate-900">
            {result.score ?? 0}
          </div>

        </div>

        <div>

          <div className="text-xs uppercase tracking-wide text-slate-500">
            Percentage
          </div>

          <div className="mt-1 text-lg font-bold text-indigo-600">
            {(result.percentage ?? 0).toFixed(1)}%
          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="mt-4 flex items-center justify-between border-t pt-3">

        <div className="flex items-center gap-4 text-sm text-slate-600">

          <span>
            Attempt {result.attempt_number}
          </span>

          <span className="flex items-center gap-1">

            <ShieldAlert size={15} />

            {result.violation_count}

          </span>

        </div>

        <Link
          to={routes.results.review(
            examUid,
            result.attempt_uid
          )}
          className="
            inline-flex
            items-center
            gap-1
            font-medium
            text-indigo-600
          "
        >
          View

          <ChevronRight size={16} />

        </Link>

      </div>

    </MobileCard>
  );
}