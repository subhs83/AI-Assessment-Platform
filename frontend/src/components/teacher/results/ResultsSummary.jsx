// src/components/teacher/results/ResultsSummary.jsx

import MobileStatsGrid from "../../ui/mobile/MobileStatsGrid";

import {
  Users,
  TrendingUp,
  Trophy,
  AlertTriangle,
} from "lucide-react";

export default function ResultsSummary({
  summary,
}) {
  const cards = [
    {
      title: "Students Appeared",
      value: summary.students,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Average Score",
      value: `${summary.averagePercentage.toFixed(1)}%`,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Highest Score",
      value: `${summary.highestScore.toFixed(1)}%`,
      icon: Trophy,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Auto Submitted",
      value: summary.autoSubmitted,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <>
      {/* Desktop */}

      <div className="hidden gap-4 md:grid md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {card.value}
                  </p>

                </div>

                <div
                  className={`rounded-xl p-3 ${card.iconBg}`}
                >
                  <Icon
                    size={22}
                    className={card.iconColor}
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}

      <div className="md:hidden">
        <MobileStatsGrid items={cards} />
      </div>
    </>
  );
}