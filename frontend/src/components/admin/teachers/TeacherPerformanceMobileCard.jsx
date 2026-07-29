import {
  Users,
  Mail,
  FileText,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function TeacherPerformanceMobileCard({
  teachers = [],
}) {
  return (
    <div className="space-y-3">

      {teachers.map((teacher) => (

        <MobileCard
          key={teacher.teacher_id}
        >

          {/* Teacher */}
          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-violet-100 p-2">
              <Users
                size={18}
                className="text-violet-600"
              />
            </div>

            <div className="min-w-0 flex-1">

              <div className="font-semibold text-slate-900">
                {teacher.teacher_name}
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">

                <Mail
                  size={14}
                  className="text-blue-500"
                />

                <span className="truncate">
                  {teacher.email}
                </span>

              </div>

            </div>

          </div>

          {/* Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-3">

            <div>

              <div className="flex items-center gap-1 text-xs text-slate-500">

                <FileText
                  size={13}
                  className="text-indigo-500"
                />

                Exams

              </div>

              <div className="mt-1 font-semibold">
                {teacher.exam_count}
              </div>

            </div>

            <div>

              <div className="flex items-center gap-1 text-xs text-slate-500">

                <ClipboardList
                  size={13}
                  className="text-amber-500"
                />

                Attempts

              </div>

              <div className="mt-1 font-semibold">
                {teacher.attempt_count}
              </div>

            </div>

            <div className="text-right">

              <div className="flex items-center justify-end gap-1 text-xs text-slate-500">

                <TrendingUp
                  size={13}
                  className="text-green-500"
                />

                Average

              </div>

              <div className="mt-1 font-semibold text-green-600">
                {teacher.avg_percentage}%
              </div>

            </div>

          </div>

        </MobileCard>

      ))}

    </div>
  );
}