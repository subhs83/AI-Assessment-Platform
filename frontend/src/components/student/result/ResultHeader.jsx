import { memo } from "react";
import {
  Eye,
  CheckCircle2,
  TimerReset,
  ShieldAlert,
  Trophy,
  Target,
} from "lucide-react";

import logo from "../../../assets/logo.png";

const ResultHeader = ({
  result,
  currentAttempt,
}) => {
  const statusBadge =
    result.auto_submitted_reason === "time_expired" ? (
      <span className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
        <TimerReset className="h-4 w-4" />
        Time Expired
      </span>
    ) : result.auto_submitted_reason === "max_violations" ? (
      <span className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800">
        <ShieldAlert className="h-4 w-4" />
        Auto Submitted
      </span>
    ) : (
      <span className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-green-200 bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </span>
    );

  return (
    <div
      className="
        mb-6
        rounded-3xl
        border
        border-indigo-100
        bg-gradient-to-r
        from-indigo-50
        via-white
        to-purple-50
        shadow-sm
      "
    >
      <div className="p-5">

        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-6">

          {/* Left */}
          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <img
                src={logo}
                alt="INDIAEDUCORE"
                className="h-12 w-auto object-contain"
              />
            </div>

            <div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-600">
                INDIAEDUCORE
              </div>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {result.exam_title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                AI Powered Assessment Report
              </p>

            </div>

          </div>

          {/* Center */}

          <div className="flex flex-col items-center gap-2">

            {statusBadge}

            {result.review_enabled && (
              <span className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <Eye className="h-4 w-4" />
                Review Available
              </span>
            )}

          </div>

          {/* Right */}

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

            <p className="text-right text-lg font-bold text-slate-900">
              {result.student_name}
            </p>

            <div className="mt-3 space-y-2 text-sm">

              <div className="flex items-center justify-end gap-2 text-slate-600">
                <Target className="h-4 w-4 text-indigo-500" />
                Attempt #{currentAttempt?.attempt_number || 1}
              </div>

              <div className="flex items-center justify-end gap-2 font-semibold text-amber-600">
                <Trophy className="h-4 w-4" />
                Rank #{result.rank}
              </div>

            </div>

          </div>

        </div>

        {/* Mobile / Tablet */}

        <div className="lg:hidden space-y-5">

          {/* Row 1 */}

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <img
                src={logo}
                alt="INDIAEDUCORE"
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">

              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
                INDIAEDUCORE
              </div>

              <h2 className="truncate text-lg font-bold text-slate-900">
                {result.exam_title}
              </h2>

              <p className="text-sm text-slate-500">
                AI Powered Assessment Report
              </p>

            </div>

          </div>

          {/* Row 2 */}

          <div className="flex items-start justify-between gap-3">

            <div className="flex flex-col items-start gap-2">

              {statusBadge}

              {result.review_enabled && (
                <span className="inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  <Eye className="h-4 w-4" />
                  Review Available
                </span>
              )}

            </div>

            <div className="min-w-[155px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

              <p className="truncate text-right font-bold text-slate-900">
                {result.student_name}
              </p>

              <div className="mt-2 space-y-1.5 text-xs">

                <div className="flex items-center justify-end gap-2 text-slate-600">
                  <Target className="h-3.5 w-3.5 text-indigo-500" />
                  Attempt #{currentAttempt?.attempt_number || 1}
                </div>

                <div className="flex items-center justify-end gap-2 font-semibold text-amber-600">
                  <Trophy className="h-3.5 w-3.5" />
                  Rank #{result.rank}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default memo(ResultHeader);
