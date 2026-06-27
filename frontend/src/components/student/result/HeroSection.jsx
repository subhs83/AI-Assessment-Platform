import ProgressRing from "./ProgressRing";
import { memo } from "react";
import Counter from "../../common/Counter"

const HeroSection = ({
  result,
  isPassed,
  performanceTheme,
}) => {
  return (
    <section
      className="
        rounded-3xl
        border border-slate-200
        bg-white
        p-6 md:p-8
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-8">

        {/* Left Content */}
        <div className="flex-1 space-y-6">

          {/* Exam Header */}
         <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">
                {result.exam_title}
              </h2>
           

            <span
              className={`
                inline-flex items-center self-start rounded-full
                px-4 py-2 text-sm font-semibold border shadow-sm
                ${
                  result.percentage >= 90
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : result.percentage >= 75
                    ? "bg-green-100 text-green-800 border-green-200"
                    : result.percentage >= 50
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }
              `}
            >
              {performanceTheme.label}
            </span>
           </div>
          </header>

          {/* Percentage */}
          <h1
            className={`
              text-5xl md:text-7xl
              font-extrabold
              tracking-tight
              leading-none
              ${performanceTheme.text}
            `}
          >
            <Counter end={result.percentage} />%
          </h1>

          {/* Student + Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">

            {/* Student */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {result.student_name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Student
                </p>

                <p className="font-semibold text-slate-900">
                  {result.student_name}
                </p>
              </div>

            </div>

            {/* Rank */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">

              <p className="text-xs uppercase tracking-wide text-indigo-600">
                Current Rank
              </p>

              <div className="mt-1 flex items-end gap-2">

                <span className="text-3xl font-bold text-indigo-700">
                  #<Counter end={result.rank} />
                </span>

                <span className="pb-1 text-sm text-indigo-500">
                  
                  of <Counter end={result.total_participants} />
                </span>

              </div>

            </div>

          </div>

          {/* Score */}
          <div className="max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">

            <div className="mb-2 flex items-center justify-between">

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Final Score
              </p>

              <p className="text-lg font-bold text-slate-900">
                <Counter end={result.score} /> / {result.total_marks}
              </p>

            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${result.percentage}%`,
                  backgroundColor: performanceTheme.ring,
                }}
              />

            </div>

          </div>

          {/* Status */}
          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isPassed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPassed ? "🎉 Passed" : "📉 Needs Improvement"}
            </span>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              📊 Top {Math.max(100 - result.percentile, 0)}%
              
            </span>

          </div>

        </div>

        {/* Progress Ring */}
        <aside className="flex justify-center lg:justify-end self-center">
  
  <div className="w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition">

    {/* Ring */}
    <ProgressRing
      percentage={result.percentage}
      color={performanceTheme.ring}
    />

    {/* Label */}
    <div className="mt-4 text-center space-y-1">

      <p className="text-xs uppercase tracking-wide text-slate-500">
        Overall Performance
      </p>

      <p
        className="text-lg font-bold"
        style={{ color: performanceTheme.ring }}
      >
        {performanceTheme.label}
      </p>

    </div>

  </div>

</aside>

      </div>
    </section>
  );
};

export default memo(HeroSection);