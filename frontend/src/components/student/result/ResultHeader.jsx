import { memo } from "react";
import {
  GraduationCap,
  Eye,
  CheckCircle2,
  TimerReset,
  ShieldAlert,
  Trophy,
  Target,
} from "lucide-react";

const ResultHeader = ({
  result,
  currentAttempt,
}) => {
  return (
    <div
      className="
        mb-6
        rounded-3xl
        border border-white/20
        bg-gradient-to-r
        from-indigo-500/10
        via-purple-500/10
        to-pink-500/10
        backdrop-blur-xl
        shadow-sm
      "
    >
      <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Exam Result
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              {result.exam_title}
            </h2>

            <p className="text-sm text-slate-500">
              Performance report generated successfully
            </p>
          </div>

        </div>

        {/* CENTER BADGES */}
        <div className="flex flex-wrap gap-2">

          {/* Exam Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              result.auto_submitted_reason === "time_expired"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : result.auto_submitted_reason === "max_violations"
                ? "bg-red-100 text-red-800 border-red-200"
                : "bg-green-100 text-green-800 border-green-200"
            }`}
          >
            {result.auto_submitted_reason === "time_expired" ? (
              <>
                <TimerReset className="w-3.5 h-3.5" />
                Time Expired
              </>
            ) : result.auto_submitted_reason === "max_violations" ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Auto Submitted
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </>
            )}
          </span>

          {/* Review */}
          {result.review_enabled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Eye className="w-3.5 h-3.5" />
              Review Available
            </span>
          )}

        </div>

        {/* RIGHT */}
        <div className="text-right">

          <p className="font-semibold text-slate-900">
            {result.student_name}
          </p>

          <div className="mt-2 flex flex-col gap-1 text-xs">

            <span className="inline-flex items-center justify-end gap-1 text-slate-600">
              <Target className="w-3.5 h-3.5" />
              Attempt #{currentAttempt?.attempt_number || 1}
            </span>

            <span className="inline-flex items-center justify-end gap-1 font-semibold text-indigo-600">
              <Trophy className="w-3.5 h-3.5" />
              Rank #{result.rank}
            </span>

          </div>

        </div>

      </div>
    </div>
  );
};

export default memo(ResultHeader);