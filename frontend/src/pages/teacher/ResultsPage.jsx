import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";

import API from "../../api/client";
import { teacherRoutes } from "../../routes/teacherRoutes";

import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";

import ResultsSummary from "../../components/teacher/results/ResultsSummary";
import ResultTable from "../../components/teacher/results/ResultTable";
import ResultCardList from "../../components/teacher/results/ResultCardList";

export default function ResultsPage() {
  const { schoolSlug, examUid } = useParams();

  const routes = teacherRoutes(schoolSlug);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const results = useMemo(
    () => data?.results || [],
    [data]
  );

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return results;
    }

    return results.filter((result) =>
      `${result.first_name ?? ""} ${result.last_name ?? ""}`
        .toLowerCase()
        .includes(query) ||
      (result.roll_number ?? "")
        .toString()
        .includes(query)
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
      ...results.map(
        (result) => result.percentage || 0
      )
    );

    const averagePercentage =
      results.reduce(
        (sum, result) =>
          sum + (result.percentage || 0),
        0
      ) / results.length;

    const autoSubmitted = results.filter(
      (result) => result.auto_submitted_reason
    ).length;

    return {
      students: results.length,
      highestScore,
      averagePercentage,
      autoSubmitted,
    };
  }, [results]);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/api/teacher/${schoolSlug}/exams/${examUid}/results`
      );

      setData(response.data.data);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  }, [schoolSlug, examUid]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Exam Results"
        description={`Exam Title: ${data?.exam_title}`}
        actions={
          <>
           <div className="flex-1 min-w-0 md:w-72 md:flex-none">
              <input
                type="text"
                placeholder="Search student or roll..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <BackButton
              to={routes.exams.list}
              label="Go Back"
            />
          </>
        }
      />

      <ResultsSummary
        summary={summary}
      />

      {results.length === 0 ? (
        <EmptyState
          title="No results found"
          description="No student has attempted this exam yet."
        />
      ) : filteredResults.length === 0 ? (
        <EmptyState
          title="No matching students"
          description="Try a different search term."
        />
      ) : (
        <>
          <div className="text-sm text-gray-500">
            Showing {filteredResults.length} of {results.length} students
          </div>

          <>
            {/* Desktop Table */}

            <div className="hidden lg:block">
              <ResultTable
                results={filteredResults}
                examUid={examUid}
                routes={routes}
              />
            </div>

            {/* Mobile Cards */}

            <div className="lg:hidden">
              <ResultCardList
                results={filteredResults}
                examUid={examUid}
                routes={routes}
              />
            </div>
          </>
        </>
      )}

    </div>
  );
}