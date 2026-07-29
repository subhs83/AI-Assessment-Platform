import {
  Trophy,
  Medal,
} from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function TopTeachersAnalyticsMobileCard({
  teachers = [],
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">

          <Trophy
            size={20}
            className="text-amber-500"
          />

          Top Performing Teachers

        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ranked by average student performance.
        </p>

      </div>

      <div className="space-y-3 p-4">

        {teachers?.map((teacher, index) => (

          <MobileCard
            key={index}
            className={
              index === 0
                ? "border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50"
                : ""
            }
          >

            {/* Rank + Teacher */}
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center">

                {index === 0 ? (

                  <Trophy
                    size={20}
                    className="text-amber-500"
                  />

                ) : index === 1 ? (

                  <Medal
                    size={20}
                    className="text-slate-400"
                  />

                ) : index === 2 ? (

                  <Medal
                    size={20}
                    className="text-amber-700"
                  />

                ) : (

                  <span className="font-semibold text-slate-500">
                    #{index + 1}
                  </span>

                )}

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">

                {teacher.teacher_name
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}

              </div>

              <div className="min-w-0 flex-1">

                <div className="font-semibold text-slate-900">
                  {teacher.teacher_name}
                </div>

              </div>

            </div>

            {/* Metrics */}
            <div className="mt-4 flex items-center justify-between">

              <div>

                <div className="text-xs text-slate-500">
                  Exams
                </div>

                <div className="mt-1 font-semibold">
                  {teacher.exam_count}
                </div>

              </div>

              <div>

                <div className="text-xs text-slate-500">
                  Attempts
                </div>

                <div className="mt-1 font-semibold">
                  {teacher.attempt_count}
                </div>

              </div>

              <div className="text-right">

                <div className="text-xs text-slate-500">
                  Average
                </div>

                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {teacher.avg_percentage}%
                </span>

              </div>

            </div>

          </MobileCard>

        ))}

      </div>

    </div>
  );
}