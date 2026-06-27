import {
  CheckCircle2,
  X,
  Navigation,
} from "lucide-react";

import { useExamStore } from "../../../store/examStore";
import { useNavigate } from "react-router-dom";

export default function PaletteDrawer({
  schoolSlug,
  attemptId,
  currentIndex,
  open,
  onClose,
  isOffline,
}) {
  const navigate = useNavigate();

  const palette = useExamStore((s) => s.palette);
  const answers = useExamStore((s) => s.answers);

  const goToQuestion = (index) => {
    navigate(`/school/${schoolSlug}/attempt/${attemptId}/${index}`);
    onClose?.();
  };

  const getStatus = (index) => {
    const key = `${attemptId}_${index}`;
    return answers[key] ? "answered" : "not_answered";
  };

  const answeredCount = palette.filter(
    (q) => answers[`${attemptId}_${q.index}`]
  ).length;

  const remainingCount =
    palette.length - answeredCount;

  const progress =
    palette.length === 0
      ? 0
      : (answeredCount / palette.length) * 100;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">

      {/* Backdrop */}

      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      {/* Drawer */}

      <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] rounded-t-3xl bg-white shadow-2xl">

        {/* Drag Handle */}

        <div className="flex justify-center py-3">

          <div className="h-1.5 w-12 rounded-full bg-slate-300" />

        </div>

        {/* Header */}

        <div className="sticky top-0 border-b border-slate-100 bg-white px-5 pb-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">

                <Navigation
                  size={20}
                  className="text-indigo-600"
                />

              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Question Navigator
                </h2>

                <p className="text-xs text-slate-500">
                  Tap any question to jump
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-slate-100"
            >
              <X size={20} />
            </button>

          </div>

          {/* Progress */}

          <div className="mt-4">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-slate-600">
                Progress
              </span>

              <span className="font-semibold text-indigo-600">
                {answeredCount}/{palette.length}
              </span>

            </div>

            <div className="h-2 rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          {/* Stats */}

          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">

              <div className="text-xs uppercase text-emerald-700">
                Answered
              </div>

              <div className="mt-1 flex items-center gap-2">

                <CheckCircle2
                  size={18}
                  className="text-emerald-600"
                />

                <span className="text-xl font-bold text-emerald-600">
                  {answeredCount}
                </span>

              </div>

            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">

              <div className="text-xs uppercase text-amber-700">
                Remaining
              </div>

              <div className="mt-1 text-xl font-bold text-amber-600">
                {remainingCount}
              </div>

            </div>

          </div>

        </div>

        {/* Question Grid */}

        <div className="overflow-y-auto px-5 py-5">

          <div className="grid grid-cols-6 gap-3">

            {palette.map((q) => {
              const status = getStatus(q.index);
              const isActive =
                q.index === currentIndex;

              return (
                <button
                  key={q.index}
                  disabled={isOffline}
                  onClick={() =>
                    goToQuestion(q.index)
                  }
                  className={`
                    relative
                    h-12
                    w-12
                    rounded-2xl
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      isOffline
                        ? "cursor-not-allowed opacity-50"
                        : "active:scale-95"
                    }

                    ${
                      isActive
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : status === "answered"
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-700"
                    }
                  `}
                >
                  {q.index + 1}

                  {isActive && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-yellow-400" />
                  )}
                </button>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}