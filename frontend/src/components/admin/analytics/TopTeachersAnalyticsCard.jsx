import {
  Trophy,
  Medal,
} from "lucide-react";

export default function TopTeachersAnalyticsCard({
  teachers,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

        <div>

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

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b bg-slate-50">

            <tr className="text-sm font-semibold text-slate-700">

              <th className="w-16 px-6 py-4 text-center">
                #
              </th>

              <th className="px-6 py-4 text-left">
                Teacher
              </th>

              <th className="px-6 py-4 text-center">
                Exams
              </th>

              <th className="px-6 py-4 text-center">
                Attempts
              </th>

              <th className="px-6 py-4 text-center">
                Average
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {teachers?.map((teacher, index) => (

              <tr
                key={index}
                className={
                  index === 0
                    ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50"
                    : "hover:bg-slate-50 transition"
                }
              >

                <td className="px-6 py-4 text-center">

                  {index === 0 ? (

                    <Trophy
                      size={18}
                      className="mx-auto text-amber-500"
                    />

                  ) : index === 1 ? (

                    <Medal
                      size={18}
                      className="mx-auto text-slate-400"
                    />

                  ) : index === 2 ? (

                    <Medal
                      size={18}
                      className="mx-auto text-amber-700"
                    />

                  ) : (

                    <span className="font-semibold text-slate-500">
                      {index + 1}
                    </span>

                  )}

                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">

                      {teacher.teacher_name
                        ?.split(" ")
                        .map((name) => name[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}

                    </div>

                    <span className="font-medium text-slate-800">
                      {teacher.teacher_name}
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4 text-center">
                  {teacher.exam_count}
                </td>

                <td className="px-6 py-4 text-center">
                  {teacher.attempt_count}
                </td>

                <td className="px-6 py-4 text-center">

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {teacher.avg_percentage}%
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}