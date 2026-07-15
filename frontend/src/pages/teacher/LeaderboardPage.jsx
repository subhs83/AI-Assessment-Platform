import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../../api/client";
import { useAuthStore } from "../../store/authStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";

import LeaderboardSummary from "../../components/teacher/leaderboard/LeaderboardSummary";
import LeaderboardPodium from "../../components/teacher/leaderboard/LeaderboardPodium";
import LeaderboardTable from "../../components/teacher/leaderboard/LeaderboardTable";

export default function LeaderboardPage() {
  const { schoolSlug, examUid } = useParams();

  const { user } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      const endpoint =
        user.role === "school_admin"
          ? `/api/admin/${schoolSlug}/exams/${examUid}/leaderboard`
          : `/api/teacher/${schoolSlug}/exams/${examUid}/leaderboard`;

      const res = await API.get(endpoint);

      setData(res.data.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolSlug, examUid, user.role]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const leaderboard = data?.leaderboard || [];

  const summary = {
    students: leaderboard.length,

    highest:
      leaderboard[0]?.percentage || 0,

    average:
      leaderboard.length > 0
        ? leaderboard.reduce(
            (sum, student) =>
              sum + (student.percentage || 0),
            0
          ) / leaderboard.length
        : 0,
  };

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Leaderboard"
        description={`Exam Title: ${data?.exam_title}`}
        actions={
          <BackButton
            to={-1}
            label="Go Back"
          />
        }
      />

      <LeaderboardSummary
        summary={summary}
      />

      {leaderboard.length >= 3 && (
        <LeaderboardPodium
          leaderboard={leaderboard}
        />
      )}

      <LeaderboardTable
        leaderboard={leaderboard}
      />

    </div>
  );
}