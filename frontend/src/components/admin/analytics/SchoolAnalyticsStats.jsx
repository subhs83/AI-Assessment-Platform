import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

import MobileStatsGrid from "../../ui/mobile/MobileStatsGrid";

export default function SchoolAnalyticsStats({
  totalTeachers,
  totalExams,
  totalAttempts,
  schoolAverage,
}) {
  const items = [
    {
      title: "Teachers",
      value: totalTeachers,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Exams",
      value: totalExams,
      icon: FileText,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Attempts",
      value: totalAttempts,
      icon: ClipboardList,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "School Average",
      value: `${schoolAverage}%`,
      valueClassName: "text-green-700",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileStatsGrid items={items} />
      </div>

      {/* Desktop */}
      <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">

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
    </>
  );
}