import { useEffect } from "react";
import { Brain, CheckCircle, XCircle, Percent, FileText, CalendarDays } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

import { useSuperAdminStore } from "../../store/superAdminStore";

export default function AIAnalyticsPage() {
  const {
  aiDashboard,
  loadingAIDashboard,
  fetchAIDashboard,

  aiSourceStats,
  loadingAISourceStats,
  fetchAISourceStats,

  aiTrends,
  fetchAITrends,

  aiSchools,
  loadingAISchools,
  fetchAISchools,

  aiTeachers,
  loadingAITeachers,
  fetchAITeachers,

  aiRecent,
  loadingAIRecent,
  fetchAIRecent,

} = useSuperAdminStore();



  useEffect(() => {

    fetchAIDashboard();
    fetchAISourceStats();
    fetchAITrends();
    fetchAISchools();
    fetchAITeachers();
    fetchAIRecent();

  }, []);

  const stats = aiDashboard || {};
  const sourceStats = aiSourceStats || {};
  const trends = aiTrends || [];
  const schools = aiSchools || [];
  const teachers = aiTeachers || [];
  const recentActivity = aiRecent || [];

  if (loadingAIDashboard || loadingAISourceStats || loadingAITeachers || loadingAIRecent) {
    return (
      <div className="p-6">
        <div className="text-gray-600">
          Loading AI analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          AI Analytics
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor AI usage across the platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Total Requests */}
        <div className="bg-white rounded-xl shadow p-5 border ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <h2 className="text-3xl font-bold mt-2">
                {stats.total_requests || 0}
              </h2>
            </div>

            <Brain className="w-10 h-10 text-indigo-600" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <h2 className="text-3xl font-bold mt-2 text-green-600">
                {stats.completed_requests || 0}
              </h2>
            </div>

            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <h2 className="text-3xl font-bold mt-2 text-red-600">
                {stats.failed_requests || 0}
              </h2>
            </div>

            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <h2 className="text-3xl font-bold mt-2 text-blue-600">
                {stats.success_rate || 0}%
              </h2>
            </div>

            <Percent className="w-10 h-10 text-blue-600" />
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow border p-6">

        <h2 className="text-lg font-semibold mb-5">
          AI Source Usage
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <div className="bg-red-50 rounded-xl p-5 border">
            <div className="text-gray-500 text-sm">
              PDF
            </div>

            <div className="text-3xl font-bold mt-2 text-red-600">
              {sourceStats.pdf || 0}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border">
            <div className="text-gray-500 text-sm">
              Image
            </div>

            <div className="text-3xl font-bold mt-2 text-blue-600">
              {sourceStats.image || 0}
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-5 border">
            <div className="text-gray-500 text-sm">
              Topic
            </div>

            <div className="text-3xl font-bold mt-2 text-green-600">
              {sourceStats.topic || 0}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-5 border">
            <div className="text-gray-500 text-sm">
              Text
            </div>

            <div className="text-3xl font-bold mt-2 text-purple-600">
              {sourceStats.text || 0}
            </div>
          </div>

        </div>

      </div>

      {/* School-wise AI Usage */}

      <div className="bg-white rounded-xl shadow border p-6">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            School-wise AI Usage
          </h2>

          <div className="text-sm text-gray-500">
            {schools.length} schools
          </div>
        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  School
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Requests
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Questions
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Teachers Used
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Last Activity
                </th>

              </tr>

            </thead>

            <tbody>

              {schools.map((school) => (

                <tr
                  key={school.school_id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-4 py-4 font-medium text-gray-800">
                    {school.school_name}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-blue-600">
                      {school.requests}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-purple-600">
                      {school.questions}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-green-600">
                      {school.teachers_used}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center text-sm text-gray-500">
                    {
                      school.last_activity
                        ? new Date(
                            school.last_activity
                          ).toLocaleDateString()
                        : "-"
                    }
                  </td>

                </tr>

              ))}

              {!loadingAISchools && schools.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500"
                  >
                    No AI usage found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

        {/* Teacher-wise AI Usage */}

      <div className="bg-white rounded-xl shadow border p-6">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-lg font-semibold">
            Teacher-wise AI Usage
          </h2>

          <div className="text-sm text-gray-500">
            {teachers.length} teachers
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Teacher
                </th>

                <th className="px-4 py-3 text-left">
                  School
                </th>

                <th className="px-4 py-3 text-center">
                  Requests
                </th>

                <th className="px-4 py-3 text-center">
                  Questions
                </th>

                <th className="px-4 py-3 text-center">
                  Success %
                </th>

                <th className="px-4 py-3 text-center">
                  Last Activity
                </th>

              </tr>

            </thead>

            <tbody>

              {teachers.map((teacher) => (

                <tr
                  key={teacher.teacher_id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-4 py-4 font-medium">
                    {teacher.teacher_name}
                  </td>

                  <td className="px-4 py-4">
                    {teacher.school_name}
                  </td>

                  <td className="px-4 py-4 text-center text-blue-600 font-semibold">
                    {teacher.requests}
                  </td>

                  <td className="px-4 py-4 text-center text-purple-600 font-semibold">
                    {teacher.questions}
                  </td>

                  <td className="px-4 py-4 text-center text-green-600 font-semibold">
                    {teacher.success_rate}%
                  </td>

                  <td className="px-4 py-4 text-center text-sm text-gray-500">
                    {
                      teacher.last_activity
                        ? new Date(
                            teacher.last_activity
                          ).toLocaleDateString()
                        : "-"
                    }
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow border p-6">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-lg font-semibold">
            Recent AI Activity
          </h2>

          <div className="text-sm text-gray-500">
            Latest 50 requests
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Teacher
                </th>

                <th className="px-4 py-3 text-left">
                  School
                </th>

                <th className="px-4 py-3 text-center">
                  Source
                </th>

                <th className="px-4 py-3 text-center">
                  Questions
                </th>

                <th className="px-4 py-3 text-center">
                  Status
                </th>

                <th className="px-4 py-3 text-center">
                  Time
                </th>

              </tr>

            </thead>

            <tbody>

              {recentActivity.map((item) => (

                <tr
                  key={item.request_id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-4 py-4 font-medium">
                    {item.teacher_name}
                  </td>

                  <td className="px-4 py-4">
                    {item.school_name}
                  </td>

                  <td className="px-4 py-4 text-center capitalize">
                    {item.source_type}
                  </td>

                  <td className="px-4 py-4 text-center font-semibold text-blue-600">
                    {item.question_count}
                  </td>

                  <td className="px-4 py-4 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="px-4 py-4 text-center text-sm text-gray-500">
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow border p-6">

        <h2 className="text-lg font-semibold mb-5">
          AI Usage Trends (30 Days)
        </h2>

        <div className="h-96">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={trends}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="requests"
                stroke="#2563eb"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="questions"
                stroke="#16a34a"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      

      {/* Secondary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Questions Generated */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Questions Generated
              </p>

              <h2 className="text-3xl font-bold mt-2 text-purple-600">
                {stats.total_questions || 0}
              </h2>
            </div>

            <FileText className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        {/* Today Requests */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Today Requests
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {stats.today_requests || 0}
              </h2>
            </div>

            <CalendarDays className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        {/* Week Requests */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div>
            <p className="text-sm text-gray-500">
              Last 7 Days
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {stats.week_requests || 0}
            </h2>
          </div>
        </div>

        {/* Month Requests */}
        <div className="bg-white rounded-xl shadow p-5 border">
          <div>
            <p className="text-sm text-gray-500">
              Last 30 Days
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {stats.month_requests || 0}
            </h2>
          </div>
        </div>

      </div>

      {/* Average Questions */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Average Questions Per Request
        </h2>

        <div className="text-4xl font-bold text-indigo-600">
          {stats.avg_questions_per_request || 0}
        </div>
      </div>

    </div>
  );
}