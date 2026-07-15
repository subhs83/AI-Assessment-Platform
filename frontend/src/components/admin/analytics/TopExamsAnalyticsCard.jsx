import {
  Trophy,
  Medal,
} from "lucide-react";

export default function TopExamsAnalyticsCard({
  exams,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

        <div>

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

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b bg-slate-50">

            <tr className="text-sm font-semibold text-slate-700">

              <th className="w-16 px-6 py-4 text-center">
                #
              </th>

              <th className="px-6 py-4 text-left">
                Exam
              </th>

              <th className="px-6 py-4 text-left">
                Teacher
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

            {exams?.map((exam, index) => (

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

                <td className="px-6 py-4 font-medium text-slate-800">
                  {exam.exam_title}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {exam.teacher_name}
                </td>

                <td className="px-6 py-4 text-center">
                  {exam.attempt_count}
                </td>

                <td className="px-6 py-4 text-center">

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {exam.avg_percentage}%
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