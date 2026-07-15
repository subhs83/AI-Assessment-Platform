import { Link } from "react-router-dom";
import { Users } from "lucide-react";

export default function TopTeachersCard({
  schoolSlug,
  teachers = [],
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="flex items-center justify-between border-b px-6 py-4">

        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Users
            size={20}
            className="text-indigo-600"
          />
          Top Teachers
        </h2>

        <Link
          to={`/school/${schoolSlug}/admin/performance/teachers`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All →
        </Link>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-50 text-sm text-gray-600">

            <tr>

              <th className="px-6 py-3 text-left">
                Teacher
              </th>

              <th className="px-6 py-3 text-center">
                Exams
              </th>

              <th className="px-6 py-3 text-center">
                Attempts
              </th>

              <th className="px-6 py-3 text-center">
                Avg %
              </th>

            </tr>

          </thead>

          <tbody>

            {teachers.length > 0 ? (

              teachers.map((teacher, index) => (

                <tr
                  key={index}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-6 py-4 font-medium">
                    {teacher.teacher_name}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {teacher.exam_count}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {teacher.attempt_count}
                  </td>

                  <td className="px-6 py-4 text-center font-semibold text-green-600">
                    {teacher.avg_percentage}%
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No teacher performance available.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}