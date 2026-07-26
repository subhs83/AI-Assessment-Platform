import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import API from "../../api/client";
import { useAuthStore } from "../../store/authStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";

import LeaderboardSummary from "../../components/teacher/leaderboard/LeaderboardSummary";
import LeaderboardPodium from "../../components/teacher/leaderboard/LeaderboardPodium";
import LeaderboardTable from "../../components/teacher/leaderboard/LeaderboardTable";
import LeaderboardCardList from "../../components/teacher/leaderboard/LeaderboardCardList";

export default function LeaderboardPage() {
  const { schoolSlug, examUid } = useParams();

  const { user } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const leaderboard = useMemo(
    () => data?.leaderboard || [],
    [data]
  );

  const filteredLeaderboard = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return leaderboard;
    }

    return leaderboard.filter(
      (student) =>
        `${student.first_name ?? ""} ${student.last_name ?? ""}`
          .toLowerCase()
          .includes(query) ||
        (student.roll_number ?? "")
          .toString()
          .includes(query)
    );
  }, [leaderboard, search]);


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
            label="Back"
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

      <div className="space-y-3">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="w-full lg:w-80">

            <input
              type="text"
              placeholder="Search student or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            />

          </div>

          <div className="text-sm text-slate-500">
            Showing {filteredLeaderboard.length} of {leaderboard.length} students
          </div>

        </div>

        {/* Desktop */}

        <div className="hidden lg:block">
          <LeaderboardTable
            leaderboard={filteredLeaderboard}
          />
        </div>

        {/* Mobile */}

        <div className="lg:hidden">
          <LeaderboardCardList
            leaderboard={filteredLeaderboard}
          />
        </div>

      </div>

    </div>
  );
}