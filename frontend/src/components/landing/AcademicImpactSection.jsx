import {
  TrendingUp,
  Clock3,
  Target,
  GraduationCap,
  Sparkles
} from "lucide-react";
import Reveal from "../common/Reveal"
import StaggerContainer from "../common/StaggerContainer"
import StaggerItem from "../common/StaggerItem"

export default function AcademicImpactSection() {

  const impacts = [
    {
      icon: Clock3,
      title: "Save Teaching Time",
      metric: "Hours Saved Weekly",
      description:
        "Reduce manual effort in creating assessments and spend more time on teaching and student engagement.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },

    {
      icon: TrendingUp,
      title: "Data-Driven Decisions",
      metric: "Actionable Insights",
      description:
        "Use reports and analytics to understand performance and improve academic outcomes.",
      color: "text-green-600",
      bg: "bg-green-50"
    },

    {
      icon: Target,
      title: "Identify Learning Gaps",
      metric: "Focused Interventions",
      description:
        "Track weak areas and help students improve with targeted interventions.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },

    {
      icon: GraduationCap,
      title: "Better Learning Outcomes",
      metric: "Continuous Improvement",
      description:
        "Support academic excellence through smarter assessments and meaningful insights.",
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <section className="py-10 bg-gray-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="max-w-3xl mx-auto text-center">

          <div className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-indigo-100
            text-indigo-700
            font-medium
            mb-6">

            <Sparkles size={18} />

            Academic Impact

          </div>

          <h2 className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900">

            Smarter Assessments.
            <br />
            Better Learning Outcomes.

          </h2>

          <p className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed">

            IndiaEduCore helps educators save time, gain insights,
            and continuously improve academic performance through
            AI-assisted assessments.

          </p>

        </div>


        {/* Cards */}
        <StaggerContainer>

        <div className="
          mt-10
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-8">

          {impacts.map((item) => {

            const Icon = item.icon;

            return (
              <StaggerItem key={impacts.item}>
              <div
                className="
                  group
                  bg-white
                  border
                  rounded-3xl
                  p-8
                  shadow-sm
                  hover:shadow-xl
                  transition
                  h-full
                  flex
                  flex-col
                  text-center">

                <div
                  className={`
                    h-16
                    w-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    mx-auto
                    hover:shadow-xl
                    transition-all
                    duration-300
                    ${item.bg}`}>

                  <Icon
                    size={30}
                    className={item.color}
                  />

                </div>

                <h3 className="
                  mt-8
                  text-2xl
                  font-bold
                  text-gray-900">

                  {item.title}

                </h3>

                <div className="
                  mt-3
                  text-sm
                  font-medium
                  text-indigo-600">

                  {item.metric}

                </div>

                <p className="
                  mt-4
                  text-gray-600
                  leading-relaxed
                  flex-grow">

                  {item.description}

                </p>

              </div>
              </StaggerItem>

            );

          })}

        </div>
</StaggerContainer>

        {/* Bottom Highlight */}

        <div className="
          mt-10
          rounded-3xl
          bg-gradient-to-r
          from-indigo-600
          to-blue-600
          p-12
          text-center
          text-white">

          <h3 className="
            text-3xl
            font-bold">

            Empower Better Academic Outcomes

          </h3>

          <p className="
            mt-5
            max-w-3xl
            mx-auto
            text-lg
            text-indigo-100
            leading-relaxed">

            Save valuable time, uncover learning gaps, and make
            smarter decisions with AI-powered assessments and analytics
            designed for modern education.

          </p>

        </div>

      </div>
  </Reveal>
    
    </section>
  );

}