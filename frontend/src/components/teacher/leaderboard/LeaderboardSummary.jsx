// src/components/teacher/leaderboard/LeaderboardSummary.jsx

import {
  Users,
  Trophy,
  TrendingUp,
} from "lucide-react";

export default function LeaderboardSummary({
  summary,
}) {
  const cards = [
    {
      title: "Students Ranked",
      value: summary.students,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Top Score",
      value: `${summary.highest.toFixed(1)}%`,
      icon: Trophy,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Average Score",
      value: `${summary.average.toFixed(1)}%`,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">

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
  );
}