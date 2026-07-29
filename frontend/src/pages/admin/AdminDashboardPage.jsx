import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

import { useAdminStore } from "../../store/adminStore";
import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader"
import DashboardMetrics from "../../components/admin/dashboard/DashboardMetrics";
import TopTeachersCard from "../../components/admin/dashboard/TopTeachersCard";
import TopExamsCard from "../../components/admin/dashboard/TopExamsCard";
import TopExamsMobileCard from "../../components/admin/dashboard/TopExamsMobileCard";
import TopTeachersMobileCard from "../../components/admin/dashboard/TopTeachersMobileCard";

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

  }, [schoolSlug, fetchDashboard]);

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
  <PageHeader
    title="Dashboard"
    description="Monitor your school's performance and activity."
    icon={LayoutDashboard}
    iconClassName="bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600"
  />


  {/* Metrics */}
  <DashboardMetrics
    dashboardData={dashboardData}
  />


  {/* Top Teachers */}
    {/* Mobile */}
  <div className="md:hidden">
    <TopExamsMobileCard
      schoolSlug={schoolSlug}
      exams={dashboardData?.top_exams}
    />
  </div>

  {/* Desktop */}
  <div className="hidden md:block">
    <TopExamsCard
      schoolSlug={schoolSlug}
      exams={dashboardData?.top_exams}
    />
  </div>


  {/* Top Exams */}
  {/* Top Teachers */}
    <div className="md:hidden">
      <TopTeachersMobileCard
        schoolSlug={schoolSlug}
        teachers={dashboardData?.top_teachers}
      />
    </div>

    <div className="hidden md:block">
      <TopTeachersCard
        schoolSlug={schoolSlug}
        teachers={dashboardData?.top_teachers}
      />
    </div>

</div>

);
}