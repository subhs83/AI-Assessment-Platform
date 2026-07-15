import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

export default function SchoolAnalyticsStats({
  totalTeachers,
  totalExams,
  totalAttempts,
  schoolAverage,
}) {
  return (
    <div className="grid gap-5 md:grid-cols-4">

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              Teachers
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalTeachers}
            </p>

          </div>

          <Users
            size={24}
            className="text-blue-500"
          />

        </div>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              Exams
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalExams}
            </p>

          </div>

          <FileText
            size={24}
            className="text-indigo-500"
          />

        </div>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              Attempts
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalAttempts}
            </p>

          </div>

          <ClipboardList
            size={24}
            className="text-amber-500"
          />

        </div>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              School Average
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {schoolAverage}%
            </p>

          </div>

          <TrendingUp
            size={24}
            className="text-green-500"
          />

        </div>

      </div>

    </div>
  );
}