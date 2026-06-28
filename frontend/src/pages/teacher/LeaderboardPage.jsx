import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {Trophy,Medal,Award,Users,TrendingUp,} from "lucide-react";
import API from "../../api/client";
import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";
import { useAuthStore } from "../../store/authStore";


export default function LeaderboardPage() {
  const { schoolSlug, examId } = useParams();

  const { user } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      const endpoint =
      user.role === "school_admin"
        ? `/api/admin/${schoolSlug}/exams/${examId}/leaderboard`
        : `/api/teacher/${schoolSlug}/exams/${examId}/leaderboard`;

    const res = await API.get(endpoint);

      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolSlug, examId, user.role]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard ]);

  
  const leaderboard = data?.leaderboard || [];
  const summary = {
    students: leaderboard.length,

    highest: leaderboard[0]?.percentage || 0,

    average:
      leaderboard.length > 0
        ? leaderboard.reduce(
            (sum, s) => sum + (s.percentage || 0),
            0
          ) / leaderboard.length
        : 0,
  };

  if (loading) return <SkeletonCard />;

 return (
  <div className="space-y-6">

     
    {/* Header */}
    <PageHeader
        title="Leaderboard"
        description={`Exam Title: ${data?.exam_title}`}
        actions={<BackButton to={-1} label="Go Back" />}
      />

    {/* Summary */}
    <div className="grid gap-4 md:grid-cols-3">

      <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
        <Users size={22} />

        <div>
          <p className="text-sm text-gray-500">
            Students Ranked
          </p>

          <p className="text-2xl font-bold">
            {summary.students}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
        <Trophy size={22} />

        <div>
          <p className="text-sm text-gray-500">
            Top Score
          </p>

          <p className="text-2xl font-bold">
            {summary.highest.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
        <TrendingUp size={22} />

        <div>
          <p className="text-sm text-gray-500">
            Average Score
          </p>

          <p className="text-2xl font-bold">
            {summary.average.toFixed(1)}%
          </p>
        </div>
      </div>

    </div>

    {/* Empty */}
    {leaderboard.length === 0 ? (
      <EmptyState
        title="No results yet"
        description="Students have not attempted this exam."
      />
    ) : (
      <>

        {/* Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 items-end">

            {/* Second */}
            <div className="bg-gray-50 border rounded-lg p-4 text-center h-40 flex flex-col justify-center">

              <Medal
                size={32}
                className="mx-auto mb-2 text-gray-500"
              />

              <div className="font-semibold">
                {leaderboard[1].first_name}{" "}
                {leaderboard[1].last_name}
              </div>

              <div className="text-sm text-gray-500 mt-1">
                {leaderboard[1].percentage?.toFixed(2)}%
              </div>

            </div>

            {/* Champion */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5 text-center h-56 flex flex-col justify-center shadow-md">

              <Trophy
                size={40}
                className="mx-auto mb-2 text-yellow-600"
              />

              <div className="text-xs uppercase tracking-wide text-yellow-700">
                Champion
              </div>

              <div className="font-bold text-lg mt-1">
                {leaderboard[0].first_name}{" "}
                {leaderboard[0].last_name}
              </div>

              <div className="text-3xl font-bold text-yellow-700 mt-2">
                {leaderboard[0].percentage?.toFixed(2)}%
              </div>

              <div className="text-sm text-gray-500">
                {leaderboard[0].score} / {leaderboard[0].total_marks}
              </div>

            </div>

            {/* Third */}
            <div className="bg-orange-50 border rounded-lg p-4 text-center h-32 flex flex-col justify-center">

              <Award
                size={32}
                className="mx-auto mb-2 text-orange-500"
              />

              <div className="font-semibold">
                {leaderboard[2].first_name}{" "}
                {leaderboard[2].last_name}
              </div>

              <div className="text-sm text-gray-500 mt-1">
                {leaderboard[2].percentage?.toFixed(2)}%
              </div>

            </div>

          </div>
        )}

        {/* Ranking Table */}
        <div className="bg-white border rounded-lg overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm min-w-[850px]">

              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Roll</th>
                  <th className="p-3">Attempt</th>
                  <th className="p-3">Best Score</th>
                  <th className="p-3">%</th>
                </tr>
              </thead>

              <tbody>

                {leaderboard.map((s, index) => (
                  <tr
                    key={s.student_db_id}
                    className={`border-t hover:bg-gray-50 ${
                      index === 0
                        ? "bg-yellow-50"
                        : index === 1
                        ? "bg-gray-50"
                        : index === 2
                        ? "bg-orange-50"
                        : ""
                    }`}
                  >

                    <td className="p-3 font-semibold">

                      {index === 0 ? (
                        <span className="text-lg">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-lg">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-lg">🥉</span>
                      ) : (
                        `#${index + 1}`
                      )}

                    </td>

                    <td className="p-3 font-medium">
                      {s.first_name} {s.last_name}
                    </td>

                    <td className="p-3">
                      {s.student_class || "-"}
                    </td>

                    <td className="p-3">
                      {s.roll_number || "-"}
                    </td>

                    <td className="p-3">
                      {s.attempts_count || "-"}
                    </td>

                    <td className="p-3 font-semibold text-green-600">
                      {s.score} / {s.total_marks}
                    </td>

                    <td className="p-3 font-semibold">
                      {(s.percentage || 0).toFixed(2)}%
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