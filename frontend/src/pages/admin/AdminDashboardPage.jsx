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
  <TopTeachersCard
    schoolSlug={schoolSlug}
    teachers={dashboardData?.top_teachers}
  />


  {/* Top Exams */}
  <TopExamsCard
    schoolSlug={schoolSlug}
    exams={dashboardData?.top_exams}
  />

</div>

);
}