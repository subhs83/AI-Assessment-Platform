import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import SchoolAnalyticsStats from "../../components/admin/analytics/SchoolAnalyticsStats";
import TopTeachersAnalyticsCard from "../../components/admin/analytics/TopTeachersAnalyticsCard";
import TopExamsAnalyticsCard from "../../components/admin/analytics/TopExamsAnalyticsCard";

import { BarChart3 } from "lucide-react";

export default function SchoolAnalyticsPage() {

  const { schoolSlug } = useParams();

  const {
    schoolAnalytics,
    schoolAnalyticsLoading,
    schoolAnalyticsError,
    getSchoolAnalytics,
  } = useAdminStore();

  useEffect(() => {

    getSchoolAnalytics(
      schoolSlug
    );

  }, [schoolSlug, getSchoolAnalytics]);

  if (schoolAnalyticsLoading) {

    return <SkeletonCard />;

  }

  if (schoolAnalyticsError) {

    return (
      <ErrorState
        message={schoolAnalyticsError}
      />
    );

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

      <PageHeader
        title="School Analytics"
        description="Overview of school performance and engagement."
        icon={BarChart3}
        iconClassName="bg-blue-50 ring-1 ring-blue-100 text-blue-600"
      />

      <SchoolAnalyticsStats
        totalTeachers={total_teachers}
        totalExams={total_exams}
        totalAttempts={total_attempts}
        schoolAverage={school_average}
      />

      <TopTeachersAnalyticsCard
        teachers={top_teachers}
      />

      <TopExamsAnalyticsCard
        exams={top_exams}
      />

    </div>

  );

}