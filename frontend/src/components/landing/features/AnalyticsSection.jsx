import {
  BarChart3,
  TrendingUp,
  Trophy,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function AnalyticsSection() {
  const cards = [
    {
      icon: TrendingUp,
      title: "Reports & Trends",
      description:
        "Understand progress over time with detailed reports and trend analysis.",
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description:
        "Recognize top performers and encourage healthy competition.",
      color: "text-yellow-600",
      bg: "bg-yellow-100"
    },
    {
      icon: GraduationCap,
      title: "Student Insights",
      description:
        "Identify strengths and weak areas to improve learning outcomes.",
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      icon: Users,
      title: "Teacher Insights",
      description:
        "Monitor engagement and academic performance across subjects.",
      color: "text-purple-600",
      bg: "bg-purple-100"
    }
  ];

  return (
    <section className="py-10 bg-slate-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium mb-6">

            <Sparkles size={18} />

            Analytics & Insights

          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">

            Turn Data Into Better Decisions

          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">

            Gain deeper insights into student performance,
            teacher effectiveness, and academic outcomes.

          </p>

        </div>

        {/* Main Layout */}

        <div className="mt-10 grid lg:grid-cols-2 gap-8">

          {/* Left Dashboard */}

          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-600 text-white p-10 shadow-xl">

            <div className="flex items-center gap-3 mb-8">

              <BarChart3 size={28} />

              <h3 className="text-3xl font-bold">
                Performance Analytics
              </h3>

            </div>

            <div className="grid grid-cols-2 gap-6">

              <div className="bg-white/10 rounded-3xl p-6">

                <div className="text-green-100 text-sm">
                  Average Score
                </div>

                <div className="mt-3 text-4xl font-bold">
                  82%
                </div>

              </div>

              <div className="bg-white/10 rounded-3xl p-6">

                <div className="text-green-100 text-sm">
                  Success Rate
                </div>

                <div className="mt-3 text-4xl font-bold">
                  95%
                </div>

              </div>

              <div className="bg-white/10 rounded-3xl p-6">

                <div className="text-green-100 text-sm">
                  Top Performer
                </div>

                <div className="mt-3 text-2xl font-bold">
                  Rahul Sharma
                </div>

              </div>

              <div className="bg-white/10 rounded-3xl p-6">

                <div className="text-green-100 text-sm">
                  Growth Trend
                </div>

                <div className="mt-3 text-4xl font-bold">
                  +18%
                </div>

              </div>

            </div>

            <div className="mt-8 flex items-center gap-2 text-green-100">

              <CheckCircle2 size={18} />

              Real-time insights for educators

            </div>

          </div>

          {/* Right Cards */}
          <StaggerContainer>
          <div className="grid sm:grid-cols-2 gap-6">

            {cards.map((item) => {

              const Icon = item.icon;

              return (
                <StaggerItem key={item.title}>

                <div
                  
                  className="
                  group
                  bg-white
                  rounded-3xl
                  border
                  p-8
                  shadow-sm
                  hover:-translate-y-1
                  hover:shadow-xl
                  transition"
                >

                  <div
                    className={`
                    h-16
                    w-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    hover:shadow-xl
                  transition-all
                  duration-300
                    ${item.bg}
                  `}
                  >

                    <Icon
                      size={30}
                      className={item.color}
                    />

                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-gray-900">

                    {item.title}

                  </h3>

                  <p className="mt-4 text-gray-600 leading-relaxed">

                    {item.description}

                  </p>

                </div>
                </StaggerItem>
              );

            })}

          </div>
          </StaggerContainer>

        </div>

      </div>
</Reveal>
    </section>
  );
}