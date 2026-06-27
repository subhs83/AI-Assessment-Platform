import {
  CheckCircle2,
  Circle,
  Navigation,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useExamStore } from "../../../store/examStore";

export default function QuestionPalette({
  schoolSlug,
  attemptId,
  currentIndex,
  isOffline,
}) {
  const navigate = useNavigate();

  const palette = useExamStore((state) => state.palette);
  const answers = useExamStore((state) => state.answers);

  const goToQuestion = (index) => {
    navigate(`/school/${schoolSlug}/attempt/${attemptId}/${index}`);
  };

  const getStatus = (index) => {
    const key = `${attemptId}_${index}`;
    return answers[key] ? "answered" : "not_answered";
  };

  const answeredCount = palette.filter(
    (q) => answers[`${attemptId}_${q.index}`]
  ).length;

  const remainingCount = palette.length - answeredCount;

  const progress =
    palette.length === 0
      ? 0
      : Math.round((answeredCount / palette.length) * 100);

  return (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

    {/* Header */}

    <div className="border-b border-slate-100 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100">

          <Navigation
            size={20}
            className="text-indigo-600"
          />

        </div>

        <div className="flex-1">

          <h3 className="font-semibold text-slate-900">
            Question Navigator
          </h3>

          <p className="text-xs text-slate-500">
            Jump to any question
          </p>

        </div>

        <div className="text-right">

          <div className="text-xl font-bold text-indigo-600">
            {answeredCount}/{palette.length}
          </div>

          <div className="text-xs text-slate-500">
            Completed
          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="mt-4">

        <div className="mb-2 flex justify-between text-xs">

          <span className="text-slate-500">
            Progress
          </span>

          <span className="font-semibold text-indigo-600">
            {progress}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

    </div>

    {/* Stats */}

    <div className="grid grid-cols-2 gap-3 p-4">

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">

        <div className="text-[11px] uppercase tracking-wide text-emerald-700">
          Answered
        </div>

        <div className="mt-1 text-xl font-bold text-emerald-600">
          {answeredCount}
        </div>

      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">

        <div className="text-[11px] uppercase tracking-wide text-amber-700">
          Remaining
        </div>

        <div className="mt-1 text-xl font-bold text-amber-600">
          {remainingCount}
        </div>

      </div>

    </div>

    {/* Legend */}

    <div className="border-t border-slate-100 px-4 py-3">

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">

        <div className="flex items-center gap-1.5">

          <Navigation
            size={15}
            className="text-indigo-600"
          />

          <span>Current</span>

        </div>

        <div className="flex items-center gap-1.5">

          <CheckCircle2
            size={15}
            className="text-emerald-600"
          />

          <span>Answered</span>

        </div>

        <div className="flex items-center gap-1.5">

          <Circle
            size={15}
            className="text-slate-400"
          />

          <span>Pending</span>

        </div>

      </div>

    </div>

    {/* Question Grid */}

    <div className="border-t border-slate-100 p-4">

      <div className="grid grid-cols-5 gap-2.5">

        {palette.map((q) => {

          const status = getStatus(q.index);
          const isActive = q.index === currentIndex;

          return (
            <button
              key={q.index}
              disabled={isOffline}
              onClick={() => goToQuestion(q.index)}
              className={`
                relative
                h-11
                w-11
                rounded-xl
                text-sm
                font-semibold
                transition-all

                ${
                  isOffline
                    ? "cursor-not-allowed opacity-50"
                    : "hover:-translate-y-0.5 hover:shadow-md"
                }

                ${
                  isActive
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : status === "answered"
                    ? "bg-emerald-500 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              {q.index + 1}

              {isActive && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-yellow-400" />
              )}

            </button>
          );

        })}

      </div>

    </div>

  </div>
);
}