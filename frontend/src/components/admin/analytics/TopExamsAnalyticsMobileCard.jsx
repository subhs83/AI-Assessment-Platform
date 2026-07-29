import {
  Trophy,
  Medal,
  ClipboardList,
  Users,
} from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function TopExamsAnalyticsMobileCard({
  exams = [],
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">

          <Medal
            size={20}
            className="text-indigo-600"
          />

          Top Performing Exams

        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Exams with the highest overall student performance.
        </p>

      </div>

      <div className="space-y-3 p-4">

        {exams?.map((exam, index) => (

          <MobileCard
            key={index}
            className={
              index === 0
                ? "border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50"
                : ""
            }
          >

            {/* Rank + Exam */}
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

              <div className="min-w-0 flex-1">

                <div className="font-semibold text-slate-900">
                  {exam.exam_title}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  {exam.teacher_name}
                </div>

              </div>

            </div>

            {/* Metrics */}
            <div className="mt-4 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-1 text-xs text-slate-500">

                  <ClipboardList
                    size={13}
                    className="text-amber-500"
                  />

                  Attempts

                </div>

                <div className="mt-1 font-semibold">
                  {exam.attempt_count}
                </div>

              </div>

              <div className="text-right">

                <div className="flex items-center justify-end gap-1 text-xs text-slate-500">

                  <Users
                    size={13}
                    className="text-indigo-500"
                  />

                  Average

                </div>

                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {exam.avg_percentage}%
                </span>

              </div>

            </div>

          </MobileCard>

        ))}

      </div>

    </div>
  );
}