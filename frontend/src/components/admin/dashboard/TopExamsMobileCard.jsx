import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function TopExamsMobileCard({
  schoolSlug,
  exams = [],
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold">

          <Trophy
            size={20}
            className="text-indigo-600"
          />

          Top Exams

        </h2>

        <Link
          to={`/school/${schoolSlug}/admin/performance/exams`}
          className="text-sm font-medium text-indigo-600"
        >
          View All →
        </Link>

      </div>

      <div className="space-y-3 p-4">

        {exams.length > 0 ? (

          exams.map((exam, index) => (

            <MobileCard
              key={index}
            >

              <div className="font-semibold text-slate-900">
                {exam.exam_title}
              </div>

              <div className="mt-3 flex items-center justify-between">

                <div>

                  <div className="text-xs text-slate-500">
                    Class
                  </div>

                  <div className="font-medium">
                    {exam.class_section || "-"}
                  </div>

                </div>

                <div className="text-right">

                  <div className="text-xs text-slate-500">
                    Average
                  </div>

                  <div className="font-semibold text-green-600">
                    {exam.avg_percentage}%
                  </div>

                </div>

              </div>

              <div className="mt-3 text-sm text-slate-600">

                <span className="font-medium">
                  Attempts:
                </span>{" "}

                {exam.attempt_count}

              </div>

            </MobileCard>

          ))

        ) : (

          <div className="py-8 text-center text-sm text-slate-500">
            No exam performance available.
          </div>

        )}

      </div>

    </div>
  );
}