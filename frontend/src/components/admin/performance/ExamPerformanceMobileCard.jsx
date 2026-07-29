import { Link } from "react-router-dom";

import {
  ClipboardList,
  School,
  Users,
  TrendingUp,
  Trophy,
} from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function ExamPerformanceMobileCard({
  schoolSlug,
  exams = [],
}) {
  return (
    <div className="space-y-3">

      {exams.map((exam) => (

        <MobileCard
          key={exam.exam_uid}
        >

          {/* Exam */}
          <div className="flex items-start gap-3">

            <div className="rounded-lg bg-indigo-100 p-2">

              <ClipboardList
                size={18}
                className="text-indigo-600"
              />

            </div>

            <div className="min-w-0 flex-1">

              <div className="font-semibold text-slate-900">
                {exam.exam_title}
              </div>

            </div>

          </div>

          {/* Class & Teacher */}
          <div className="mt-4 flex items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-1 text-xs text-slate-500">

                <School
                  size={13}
                  className="text-blue-500"
                />

                Class

              </div>

              <div className="mt-1 font-medium">
                {exam.class_section || "-"}
              </div>

            </div>

            <div className="min-w-0 text-right">

              <div className="flex items-center justify-end gap-1 text-xs text-slate-500">

                <Users
                  size={13}
                  className="text-purple-500"
                />

                Teacher

              </div>

              <div className="mt-1 truncate font-medium">
                {exam.teacher_name}
              </div>

            </div>

          </div>

          {/* Attempts & Average */}
          <div className="mt-4 flex items-center justify-between gap-4">

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

                <TrendingUp
                  size={13}
                  className="text-green-500"
                />

                Average

              </div>

              <div className="mt-1 font-semibold text-green-600">
                {exam.avg_percentage}%
              </div>

            </div>

          </div>

          {/* Leaderboard */}
          {exam.attempt_count > 0 && (

            <Link
              to={`/school/${schoolSlug}/admin/performance/exams/${exam.exam_uid}/leaderboard`}
              className="
                mt-4
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-50
                px-4
                py-2
                text-sm
                font-medium
                text-blue-700
                transition
                hover:bg-blue-100
              "
            >

              <Trophy size={16} />

              View Leaderboard

            </Link>

          )}

        </MobileCard>

      ))}

    </div>
  );
}