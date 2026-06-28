    import { useEffect,useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

import {
  BarChart3,
  School,
  Users,
  ClipboardList,
  Trophy,
  TrendingUp,
  User,
  Search
} from "lucide-react";

export default function ExamPerformancePage() {

  const { schoolSlug } = useParams();
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const {
    examPerformance,
    examPerformanceLoading,
    examPerformanceError,
    getExamPerformance,
  } = useAdminStore();

  
  useEffect(() => {
    getExamPerformance(schoolSlug);
  }, [schoolSlug, getExamPerformance]);

const exams = examPerformance || [];

const teachers = [
  ...new Set(
    exams.map(
      (exam) => exam.teacher_name
    )
  ),
];

const classes = [
  ...new Set(
    exams.map((exam) => 
      exam.class_name).filter(Boolean)
  ),
];

const filteredExams = exams.filter((exam) => {

  const matchesSearch =
    exam.exam_title
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    exam.teacher_name
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (exam.class_name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesTeacher =
    teacherFilter === "all" ||
    exam.teacher_name === teacherFilter;

  const matchesClass =
    classFilter === "all" ||
    exam.class_name === classFilter;

  return (
    matchesSearch &&
    matchesTeacher &&
    matchesClass
  );
});



  if (examPerformanceLoading) {
    return <SkeletonCard />;
  }

  if (examPerformanceError) {
    return <ErrorState message={examPerformanceError} />;
  }

  if (!exams.length) {
    return (
      <EmptyState
        title="No exams found"
        message="No exam performance data is available."
      />
    );
  }



  return (
  <div className="space-y-6">

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
          Exam Performance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor overall exam performance across the school.
        </p>

      </div>

    </div>

      {/* Filters */}
<div className="grid gap-4 md:grid-cols-3">

  {/* Search */}
  <div className="relative">

    <Search
      size={16}
      className="absolute left-3 top-3 text-gray-400"
    />

    <input
      type="text"
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      placeholder="Search exam, teacher or class..."
      className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />

  </div>


  {/* Teacher Filter */}
  <div className="relative">

    <User
      size={16}
      className="absolute left-3 top-3 text-gray-400"
    />

    <select
      value={teacherFilter}
      onChange={(e) =>
        setTeacherFilter(e.target.value)
      }
      className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="all">
        All Teachers
      </option>

      {teachers.map((teacher) => (
        <option
          key={teacher}
          value={teacher}
        >
          {teacher}
        </option>
      ))}

    </select>

  </div>


  {/* Class Filter */}
  <div className="relative">

    <School
      size={16}
      className="absolute left-3 top-3 text-gray-400"
    />

    <select
      value={classFilter}
      onChange={(e) =>
        setClassFilter(e.target.value)
      }
      className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="all">
        All Classes
      </option>

      {classes.map((cls) => (
        <option
          key={cls}
          value={cls}
        >
          {cls}
        </option>
      ))}

    </select>

  </div>

</div>

    {/* Table */}
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

            {filteredExams.map((exam) => (

              <tr
                key={exam.exam_id}
                className="hover:bg-gray-50 transition"
              >

                {/* Exam */}
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


                {/* Class */}
                <td className="px-6 py-4">

                  <div className="flex items-center gap-2 text-gray-700">

                    <School
                      size={16}
                      className="text-blue-500"
                    />

                    <span>
                      {exam.class_name || "-"}
                    </span>

                  </div>

                </td>


                {/* Teacher */}
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


                {/* Attempts */}
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


                {/* Average */}
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


                {/* Leaderboard */}
                <td className="px-6 py-4 text-center">

                  <Link
                    to={`/school/${schoolSlug}/admin/performance/exams/${exam.exam_id}/leaderboard`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >

                    <Trophy size={16} />

                    View

                  </Link>

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