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
      <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-800">
        <TimerReset className="h-4 w-4" />
        Time Expired
      </span>
    ) : result.auto_submitted_reason === "max_violations" ? (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-4 py-2 text-xs font-semibold text-red-800">
        <ShieldAlert className="h-4 w-4" />
        Auto Submitted
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-4 py-2 text-xs font-semibold text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </span>
    );

  return (
    <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-white via-indigo-50 to-purple-50 shadow-lg">

      {/* Brand Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500" />

      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={logo}
              alt="INDIAEDUCORE"
              className="h-14 w-auto object-contain"
            />
          </div>

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
              INDIAEDUCORE
            </p>

            <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
              {result.exam_title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              AI Powered Assessment Report
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center gap-5 text-center lg:items-end lg:text-right">

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 lg:justify-end">

            {statusBadge}

            {result.review_enabled && (
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-700">
                <Eye className="h-4 w-4" />
                Review Available
              </span>
            )}

          </div>

          {/* Student Card */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">

            <p className="text-lg font-bold text-slate-900">
              {result.student_name}
            </p>

            <div className="mt-3 flex flex-col gap-2 text-sm">

              <span className="inline-flex items-center justify-center gap-2 text-slate-600 lg:justify-end">
                <Target className="h-4 w-4 text-indigo-600" />
                Attempt #{currentAttempt?.attempt_number || 1}
              </span>

              <span className="inline-flex items-center justify-center gap-2 font-semibold text-indigo-600 lg:justify-end">
                <Trophy className="h-4 w-4" />
                Rank #{result.rank}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default memo(ResultHeader);