import { useEffect } from "react";
import { useParams } from "react-router-dom";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";

import { useAdminStore } from "../../store/adminStore";
import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp
} from "lucide-react";

export default function TeacherPerformancePage() {

  const { schoolSlug } = useParams();

  const {
    teacherPerformance,
    teacherPerformanceLoading,
    teacherPerformanceError,
    fetchTeacherPerformance
  } = useAdminStore();

  useEffect(() => {

    fetchTeacherPerformance(
      schoolSlug
    );

  }, [schoolSlug]);

  if (teacherPerformanceLoading) {
    return <SkeletonCard />;
  }

  if (teacherPerformanceError) {
    return (
      <ErrorState
        title="Failed to load teacher performance"
        message={teacherPerformanceError}
      />
    );
  }

  return (

  <div className="space-y-6">

    {/* Header */}
    <div>

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-blue-100 p-3">
          <Users
            size={22}
            className="text-blue-600"
          />
        </div>

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Performance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Compare teacher activity and student outcomes.
          </p>

        </div>

      </div>

    </div>


    {/* Table */}
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b bg-gray-50">

            <tr className="text-left text-sm font-semibold text-gray-700">

              <th className="px-6 py-4">
                Teacher
              </th>

              <th className="px-6 py-4">
                Exams
              </th>

              <th className="px-6 py-4">
                Attempts
              </th>

              <th className="px-6 py-4">
                Average %
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {teacherPerformance.map((teacher) => (

              <tr
                key={teacher.teacher_id}
                className="hover:bg-gray-50 transition"
              >

                <td className="px-6 py-4">

                  <div className="font-semibold text-gray-900">
                    {teacher.teacher_name}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    {teacher.email}
                  </div>

                </td>


                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <FileText
                      size={16}
                      className="text-indigo-500"
                    />

                    <span className="font-medium">
                      {teacher.exam_count}
                    </span>

                  </div>

                </td>


                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <ClipboardList
                      size={16}
                      className="text-amber-500"
                    />

                    <span className="font-medium">
                      {teacher.attempt_count}
                    </span>

                  </div>

                </td>


                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <TrendingUp
                      size={16}
                      className="text-green-500"
                    />

                    <span className="font-semibold text-green-700">
                      {teacher.avg_percentage}%
                    </span>

                  </div>

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