import {
  Users,
  FileText,
  BarChart3,
  Trophy,
} from "lucide-react";

import DashboardMetricCard from "./DashboardMetricCard";

export default function DashboardMetrics({
  dashboardData,
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <DashboardMetricCard
        title="Total Teachers"
        value={dashboardData?.total_teachers || 0}
        icon={Users}
        color="blue"
      />

      <DashboardMetricCard
        title="Total Exams"
        value={dashboardData?.total_exams || 0}
        icon={FileText}
        color="green"
      />

      <DashboardMetricCard
        title="Student Attempts"
        value={dashboardData?.total_attempts || 0}
        icon={BarChart3}
        color="amber"
      />

      <DashboardMetricCard
        title="School Average"
        value={`${dashboardData?.school_average || 0}%`}
        icon={Trophy}
        color="purple"
      />

    </div>
  );
}