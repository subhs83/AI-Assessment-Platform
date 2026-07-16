import {
  BookOpen,
  ShieldAlert,
  Clock3,
} from "lucide-react";

export default function ExamHeader({
  currentIndex,
  totalQuestions,
  formattedTime,
  violationCount,
  remainingSeconds,
}) {
  const progress =
    ((currentIndex + 1) / totalQuestions) * 100;

  const isCritical = remainingSeconds <= 300;
  const isWarning =
    remainingSeconds > 300 &&
    remainingSeconds <= 900;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-xl">

      {/* Progress */}
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3">

        {/* Question */}
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <BookOpen
              size={20}
              className="text-white"
            />
          </div>

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
              Question
            </p>

            <h2 className="text-lg font-bold text-slate-900">
              {currentIndex + 1}
              <span className="mx-1 text-slate-400">/</span>
              {totalQuestions}
            </h2>

          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Desktop Violations */}
          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <ShieldAlert
                size={17}
                className="text-amber-600"
              />
            </div>

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                Violations
              </p>

              <p className="text-sm font-bold text-amber-700">
                {violationCount} / 3
              </p>

            </div>

          </div>

          {/* Timer */}
          <div
            className={`
              flex items-center gap-2 rounded-2xl px-4 py-2 font-bold shadow-md transition-all

              ${
                isCritical
                  ? "bg-red-600 text-white animate-pulse"
                  : isWarning
                  ? "bg-amber-500 text-white"
                  : "bg-indigo-600 text-white"
              }
            `}
          >

            <Clock3 size={18} />

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-90">
                Time Left
              </p>

              <p className="text-lg leading-none tracking-wider">
                {formattedTime}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Mobile Violations */}
      <div className="border-t border-slate-100 bg-amber-50 px-4 py-2 sm:hidden">

        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">

          <ShieldAlert size={14} />

          <span>
            Violations {violationCount} / 3
          </span>

        </div>

      </div>

    </header>
  );
}