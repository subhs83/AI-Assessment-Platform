import {
  Users,
  FileText,
  BarChart3,
  Trophy,
} from "lucide-react";

import DashboardMetricCard from "./DashboardMetricCard";
import MobileStatsGrid from "../../ui/mobile/MobileStatsGrid";

export default function DashboardMetrics({
  dashboardData,
}) {
  const items = [
    {
      title: "Total Teachers",
      value: dashboardData?.total_teachers || 0,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      color: "blue",
    },
    {
      title: "Total Exams",
      value: dashboardData?.total_exams || 0,
      icon: FileText,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      color: "green",
    },
    {
      title: "Student Attempts",
      value: dashboardData?.total_attempts || 0,
      icon: BarChart3,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      color: "amber",
    },
    {
      title: "School Average",
      value: `${dashboardData?.school_average || 0}%`,
      icon: Trophy,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      color: "purple",
    },
  ];

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileStatsGrid items={items} />
      </div>

      {/* Desktop */}
      <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <DashboardMetricCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>
    </>
  );
}