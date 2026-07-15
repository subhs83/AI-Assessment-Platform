import { Link } from "react-router-dom";

import {
  ClipboardList,
  School,
  Users,
  TrendingUp,
  Trophy,
} from "lucide-react";

export default function ExamPerformanceTable({
  schoolSlug,
  exams,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b bg-gray-50">

            <tr className="text-sm font-semibold text-gray-700">

              <th className="px-6 py-4 text-left">
                Exam
              </th>

              <th className="px-6 py-4 text-left">
                Class
              </th>

              <th className="px-6 py-4 text-left">
                Teacher
              </th>

              <th className="px-6 py-4 text-center">
                Attempts
              </th>

              <th className="px-6 py-4 text-center">
                Average %
              </th>

              <th className="px-6 py-4 text-center">
                Leaderboard
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {exams.map((exam) => (

              <tr
                key={exam.exam_uid}
                className="hover:bg-gray-50 transition"
              >

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-lg bg-indigo-100 p-2">

                      <ClipboardList
                        size={16}
                        className="text-indigo-600"
                      />

                    </div>

                    <div className="font-semibold text-gray-900">
                      {exam.exam_title}
                    </div>

                  </div>

                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2 text-gray-700">

                    <School
                      size={16}
                      className="text-blue-500"
                    />

                    <span>
                      {exam.class_section || "-"}
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2 text-gray-700">

                    <Users
                      size={16}
                      className="text-purple-500"
                    />

                    <span>
                      {exam.teacher_name}
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4 text-center">

                  <div className="flex items-center justify-center gap-2">

                    <ClipboardList
                      size={16}
                      className="text-amber-500"
                    />

                    <span className="font-medium">
                      {exam.attempt_count}
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4 text-center">

                  <div className="flex items-center justify-center gap-2">

                    <TrendingUp
                      size={16}
                      className="text-green-500"
                    />

                    <span className="font-semibold text-green-700">
                      {exam.avg_percentage}%
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4 text-center">

                  {exam.attempt_count > 0 && (

                    <Link
                      to={`/school/${schoolSlug}/admin/performance/exams/${exam.exam_uid}/leaderboard`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                    >

                      <Trophy size={16} />

                      View

                    </Link>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}