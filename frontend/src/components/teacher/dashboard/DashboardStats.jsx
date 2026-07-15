import { FileText, Users } from "lucide-react";

import DashboardStatCard from "./DashboardStatCard";

export default function DashboardStats({
  stats,
}) {
  const cards = [
    {
      title: "Total Exams",
      value: stats.total_exams,
      subtitle: "Live Data",
      icon: FileText,
      valueClassName: "text-indigo-700",
      iconClassName: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Total Attempts",
      value: stats.total_attempts,
      subtitle: "Live Data",
      icon: Users,
      valueClassName: "text-green-700",
      iconClassName: "bg-green-100 text-green-600",
    },
    {
      title: "Draft Exams",
      value: stats.draft_exams,
      subtitle: "Pending publication",
      icon: FileText,
      valueClassName: "text-amber-700",
      iconClassName: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">

      {cards.map((card) => (
        <DashboardStatCard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          valueClassName={card.valueClassName}
          iconClassName={card.iconClassName}
        />
      ))}

    </div>
  );
}