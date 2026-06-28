import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import {
  BarChart3,
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  Trophy,
  Medal
} from "lucide-react";

export default function SchoolAnalyticsPage() {
  const { schoolSlug } = useParams();

  const {
    schoolAnalytics,
    schoolAnalyticsLoading,
    schoolAnalyticsError,
    getSchoolAnalytics,
  } = useAdminStore();

  useEffect(() => {
    getSchoolAnalytics(schoolSlug);
  }, [schoolSlug, getSchoolAnalytics]);

  if (schoolAnalyticsLoading) {
    return <SkeletonCard />;
  }

  if (schoolAnalyticsError) {
    return <ErrorState message={schoolAnalyticsError} />;
  }

  if (!schoolAnalytics) {
    return (
      <EmptyState
        title="No analytics data"
        message="School analytics are not available yet."
      />
    );
  }

  const {
    total_teachers,
    total_exams,
    total_attempts,
    school_average,
    top_teachers,
    top_exams,
  } = schoolAnalytics;

  return (
  <div className="space-y-8">

    {/* Header */}
    <div className="flex items-center gap-4">

      <div className="rounded-2xl bg-indigo-100 p-3">
        <BarChart3
          size={24}
          className="text-indigo-600"
        />
      </div>

      <div>

        <h1 className="text-3xl font-bold text-gray-900">
          School Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of school performance and engagement.
        </p>

      </div>

    </div>


    {/* Stats */}
    <div className="grid gap-5 md:grid-cols-4">

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              Teachers
            </p>

            <p className="mt-2 text-3xl font-bold">
              {total_teachers}
            </p>

          </div>

          <Users
            className="text-blue-500"
            size={24}
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
              {total_exams}
            </p>

          </div>

          <FileText
            className="text-indigo-500"
            size={24}
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
              {total_attempts}
            </p>

          </div>

          <ClipboardList
            className="text-amber-500"
            size={24}
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
              {school_average}%
            </p>

          </div>

          <TrendingUp
            className="text-green-500"
            size={24}
          />

        </div>

      </div>

    </div>


    
    {/* Top Teachers */}
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

          <thead className="bg-slate-50 border-b">

            <tr className="text-sm font-semibold text-slate-700">

              <th className="px-6 py-4 text-center w-16">
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

            {top_teachers?.map((t, idx) => (

              <tr
                key={idx}
                className={
                  idx === 0
                    ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50"
                    : "hover:bg-slate-50 transition"
                }
              >

                <td className="px-6 py-4 text-center">

                  {idx === 0 ? (
                    <Trophy
                      size={18}
                      className="mx-auto text-amber-500"
                    />
                  ) : idx === 1 ? (
                    <Medal
                      size={18}
                      className="mx-auto text-slate-400"
                    />
                  ) : idx === 2 ? (
                    <Medal
                      size={18}
                      className="mx-auto text-amber-700"
                    />
                  ) : (
                    <span className="font-semibold text-slate-500">
                      {idx + 1}
                    </span>
                  )}

                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">

                      {t.teacher_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}

                    </div>

                    <span className="font-medium text-slate-800">
                      {t.teacher_name}
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4 text-center">
                  {t.exam_count}
                </td>

                <td className="px-6 py-4 text-center">
                  {t.attempt_count}
                </td>

                <td className="px-6 py-4 text-center">

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {t.avg_percentage}%
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

    {/* Top Exams */}
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

            <thead className="bg-slate-50 border-b">

              <tr className="text-sm font-semibold text-slate-700">

                <th className="px-6 py-4 text-center w-16">
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

              {top_exams?.map((e, idx) => (

                <tr
                  key={idx}
                  className={
                    idx === 0
                      ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50"
                      : "hover:bg-slate-50 transition"
                  }
                >

                  <td className="px-6 py-4 text-center">

                    {idx === 0 ? (
                      <Trophy
                        size={18}
                        className="mx-auto text-amber-500"
                      />
                    ) : idx === 1 ? (
                      <Medal
                        size={18}
                        className="mx-auto text-slate-400"
                      />
                    ) : idx === 2 ? (
                      <Medal
                        size={18}
                        className="mx-auto text-amber-700"
                      />
                    ) : (
                      <span className="font-semibold text-slate-500">
                        {idx + 1}
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {e.exam_title}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {e.teacher_name}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {e.attempt_count}
                  </td>

                  <td className="px-6 py-4 text-center">

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {e.avg_percentage}%
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

  </div>
);
}