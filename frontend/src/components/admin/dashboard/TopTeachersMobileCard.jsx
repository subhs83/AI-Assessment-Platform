import { Link } from "react-router-dom";
import { Users } from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function TopTeachersMobileCard({
  schoolSlug,
  teachers = [],
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold">

          <Users
            size={20}
            className="text-indigo-600"
          />

          Top Teachers

        </h2>

        <Link
          to={`/school/${schoolSlug}/admin/performance/teachers`}
          className="text-sm font-medium text-indigo-600"
        >
          View All →
        </Link>

      </div>

      <div className="space-y-3 p-4">

        {teachers.length > 0 ? (

          teachers.map((teacher, index) => (

            <MobileCard
              key={index}
            >

              <div className="font-semibold text-slate-900">
                {teacher.teacher_name}
              </div>

              <div className="mt-3 flex items-center justify-between">

                <div>

                  <div className="text-xs text-slate-500">
                    Exams
                  </div>

                  <div className="font-medium">
                    {teacher.exam_count}
                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">
                    Attempts
                  </div>

                  <div className="font-medium">
                    {teacher.attempt_count}
                  </div>

                </div>

                <div className="text-right">

                  <div className="text-xs text-slate-500">
                    Average
                  </div>

                  <div className="font-semibold text-green-600">
                    {teacher.avg_percentage}%
                  </div>

                </div>

              </div>

            </MobileCard>

          ))

        ) : (

          <div className="py-8 text-center text-sm text-slate-500">
            No teacher performance available.
          </div>

        )}

      </div>

    </div>
  );
}