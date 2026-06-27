import { useEffect, useState, useMemo} from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/client";
import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { teacherRoutes } from "../../routes/teacherRoutes";
import BackButton from "../../components/ui/BackButton";

export default function ResultsPage() {
  const { schoolSlug, examId } = useParams();
  const routes = teacherRoutes(schoolSlug);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // -----------------------------
  // SAFE DERIVED DATA
  // -----------------------------
  const results = data?.results ?? [];

  const filteredResults = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return results;

    return results.filter((r) =>
      `${r.first_name ?? ""} ${r.last_name ?? ""}`
        .toLowerCase()
        .includes(q) ||
      (r.roll_number ?? "").toString().includes(q)
    );
  }, [search, results]);

  const summary = useMemo(() => {
    if (!results.length) {
      return {
        students: 0,
        highestScore: 0,
        averagePercentage: 0,
        autoSubmitted: 0,
      };
    }

    const highestScore = Math.max(
      ...results.map((r) => r.percentage || 0)
    );

    const averagePercentage =
      results.reduce(
        (sum, r) => sum + (r.percentage || 0),
        0
      ) / results.length;

    const autoSubmitted = results.filter(
      (r) => r.auto_submitted_reason
    ).length;

    return {
      students: results.length,
      highestScore,
      averagePercentage,
      autoSubmitted,
    };
  }, [results]);
  // -----------------------------
  // API CALL
  // -----------------------------
  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/api/teacher/${schoolSlug}/exams/${examId}/results`
      );

      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [examId]);



  if (loading) return <SkeletonCard />;

  return (
  <div className="space-y-6">

    {/* Back */}
    <BackButton to={routes.exams.list} label="Go Back" />
    
    {/* Header */}
    <PageHeader
      title="Exam Results"
      description={`Exam Title: ${data?.exam_title}`}
      actions={
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      }
    />

    {/* Summary Cards */}
    <div className="grid gap-4 md:grid-cols-4">

      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Students Appeared
        </p>
        <p className="text-2xl font-bold mt-2">
          {summary.students}
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Average Score
        </p>
        <p className="text-2xl font-bold mt-2">
          {summary.averagePercentage.toFixed(1)}%
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Highest Score
        </p>
        <p className="text-2xl font-bold mt-2">
          {summary.highestScore.toFixed(1)}%
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Auto Submitted
        </p>
        <p className="text-2xl font-bold mt-2">
          {summary.autoSubmitted}
        </p>
      </div>

    </div>

    {/* Empty Exam State */}
    {results.length === 0 ? (
      <EmptyState
        title="No results found"
        description="No student has attempted this exam yet."
      />
    ) : filteredResults.length === 0 ? (

      /* Empty Search State */
      <EmptyState
        title="No matching students"
        description="Try a different search term."
      />

    ) : (

      <>
        {/* Count */}
        <div className="text-sm text-gray-500">
          Showing {filteredResults.length} of {results.length} students
        </div>

        {/* Table */}
        <div className="bg-white border rounded-lg overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm min-w-[900px]">

              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Roll</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">%</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Violation</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredResults.map((r, index) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-3 font-semibold text-gray-500">
                      {index + 1}
                    </td>

                    <td
                      className="p-3 cursor-pointer"
                      onClick={() =>
                        navigate(routes.exams.studentAttempts(examId,r.student_id))
                      }
                    >
                      <div className="font-medium text-indigo-600 hover:underline">
                        {r.first_name} {r.last_name}
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        View Attempts →
                      </div>
                    </td>

                    <td className="p-3">
                      {r.student_class || "-"}
                    </td>

                    <td className="p-3">
                      {r.roll_number || "-"}
                    </td>

                    <td className="p-3 font-semibold">
                      {r.score} / {r.total_marks}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {(r.percentage || 0).toFixed(2)}%
                      </span>
                    </td>

                    <td className="p-3 text-center font-semibold">
                      {r.attempts_count}
                    </td>

                    <td className="p-3">
                      {r.violation_count ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {r.violation_count}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          0
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      {r.auto_submitted_reason ? (
                        <div>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            Auto Submitted
                          </span>

                          <div className="text-xs text-gray-500 mt-1">
                            {r.auto_submitted_reason}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Completed
                        </span>
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </>
    )}

  </div>
);
}