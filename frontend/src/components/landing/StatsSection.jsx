import {
Brain,
FileCheck,
Users,
TrendingUp,
ArrowUpRight,
} from "lucide-react";
import StaggerContainer from "../common/StaggerContainer";
import StaggerItem from "../common/StaggerItem";
import Counter from "../common/Counter";

export default function StatsSection() {
const stats = [
{
  icon: Brain,
  value: 10000,
  suffix: "+",
  label: "Questions Generated",
  description: "AI-powered content creation",
  color: "text-blue-600",
  bg: "bg-blue-50",
},
{
  icon: FileCheck,
  value: 1000,
  suffix: "+",
  label: "Exams Conducted",
  description: "Assessments created and delivered",
  color: "text-green-600",
  bg: "bg-green-50",
},
{
  icon: Users,
  value: 100,
  suffix: "+",
  label: "Teachers",
  description: "Educators using the platform",
  color: "text-purple-600",
  bg: "bg-purple-50",
},
{
  icon: TrendingUp,
  value: 95,
  suffix: "%",
  label: "AI Success Rate",
  description: "Reliable question generation",
  color: "text-orange-600",
  bg: "bg-orange-50",
},
];

return ( <section className="py-12 bg-slate-50">

  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center mb-10">

      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-blue-100
          text-blue-700
          px-4
          py-2
          text-sm
          font-medium
          mb-5
        "
      >
        Platform Impact
      </span>

      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
        Trusted by Educators
      </h2>

      <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
        Helping schools and teachers streamline assessment creation,
        exam management, and academic performance analysis.
      </p>

    </div>
    <StaggerContainer>
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <StaggerItem key={stat.label}> 
          <div
            className="
              group
              bg-white
              rounded-3xl
              border
              border-gray-200
              p-8
              h-full
              hover:shadow-xl
              hover:-translate-y-1
              transition-all
              duration-300
            "
          >

            <div className="flex items-center justify-between group">

              <div
                className={`
                  h-14
                  w-14
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  hover:shadow-xl
                  transition-all
                  duration-300
                  ${stat.bg}
                `}
              >
                <Icon
                  size={28}
                  className={stat.color}
                />
              </div>

              <ArrowUpRight
                size={18}
                className="
                  text-gray-300
                  group-hover:text-gray-500
                  transition
                "
              />

            </div>

            <div
              className={`
                mt-6
                text-4xl
                font-bold
                ${stat.color}
              `}
            >
              <Counter
              end={stat.value}
              suffix={stat.suffix}
              enableScrollSpy
            />
            </div>

            <div className="mt-2 font-semibold text-gray-900">
              {stat.label}
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {stat.description}
            </div>

          </div>
          </StaggerItem>
        );
      })}

    </div>
</StaggerContainer>
  </div>
</section>
);
}
