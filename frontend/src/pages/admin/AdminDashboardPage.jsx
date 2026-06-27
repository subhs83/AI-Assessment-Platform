import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  BarChart3,
  LayoutDashboard ,
  Trophy
} from "lucide-react";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";

export default function AdminDashboardPage() {

  const { schoolSlug } = useParams();

  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboard,
  } = useAdminStore();

  useEffect(() => {

    fetchDashboard(
      schoolSlug
    );

  }, [schoolSlug]);

  if (dashboardLoading) {

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );

  }

  if (dashboardError) {

    return (
      <ErrorState
        title="Failed to load dashboard"
        message={dashboardError}
      />
    );

  }

  return (

<div className="space-y-8">

  {/* Header */}
  <div className="flex items-center gap-4">

    <div className="rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 p-3">
      <LayoutDashboard 
        size={26}
        className="text-indigo-600"
      />
    </div>

    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
        Dashboard
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Overview of your school's activity and performance.
      </p>
    </div>

  </div>


  {/* Metrics */}
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

    {/* Teachers */}
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            Total Teachers
          </p>

          <div className="mt-3 text-4xl font-bold text-blue-600">
            {dashboardData?.total_teachers || 0}
          </div>

        </div>

        <div className="rounded-2xl bg-blue-100 p-4">

          <Users
            size={28}
            className="text-blue-600"
          />

        </div>

      </div>

    </div>


    {/* Exams */}
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            Total Exams
          </p>

          <div className="mt-3 text-4xl font-bold text-green-600">
            {dashboardData?.total_exams || 0}
          </div>

        </div>

        <div className="rounded-2xl bg-green-100 p-4">

          <FileText
            size={28}
            className="text-green-600"
          />

        </div>

      </div>

    </div>


    {/* Attempts */}
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            Student Attempts
          </p>

          <div className="mt-3 text-4xl font-bold text-amber-600">
            {dashboardData?.total_attempts || 0}
          </div>

        </div>

        <div className="rounded-2xl bg-amber-100 p-4">

          <BarChart3
            size={28}
            className="text-amber-600"
          />

        </div>

      </div>

    </div>


    {/* School Average */}
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            School Average
          </p>

          <div className="mt-3 text-4xl font-bold text-purple-600">
            {dashboardData?.school_average || 0}%
          </div>

        </div>

        <div className="rounded-2xl bg-purple-100 p-4">

          <Trophy
            size={28}
            className="text-purple-600"
          />

        </div>

      </div>

    </div>

  </div>


  {/* Top Teachers */}
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

          {dashboardData?.top_teachers?.map((teacher, index) => (

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

          ))}

        </tbody>

      </table>

    </div>

  </div>


  {/* Top Exams */}
  <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

    <div className="flex items-center justify-between border-b px-6 py-4">

      <h2 className="flex items-center gap-2 text-lg font-semibold">

        <Trophy
          size={20}
          className="text-indigo-600"
        />

        Top Exams

      </h2>

      <Link
        to={`/school/${schoolSlug}/admin/performance/exams`}
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
              Exam
            </th>

            <th className="px-6 py-3 text-left">
              Class
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

          {dashboardData?.top_exams?.map((exam, index) => (

            <tr
              key={index}
              className="border-t hover:bg-gray-50"
            >

              <td className="px-6 py-4 font-medium">
                {exam.exam_title}
              </td>

              <td className="px-6 py-4">
                {exam.class_name || "-"}
              </td>

              <td className="px-6 py-4 text-center">
                {exam.attempt_count}
              </td>

              <td className="px-6 py-4 text-center font-semibold text-green-600">
                {exam.avg_percentage}%
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