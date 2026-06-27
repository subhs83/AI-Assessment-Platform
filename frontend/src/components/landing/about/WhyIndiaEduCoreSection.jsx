import {
  Clock,
  Sparkles,
  BarChart3,
  Users
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function WhyIndiaEduCoreSection() {

  const items = [
    {
      icon: Clock,
      title: "Save Time",
      description:
        "Reduce hours spent manually creating assessments and focus more on teaching and student engagement.",
      bg: "bg-blue-50",
      color: "text-blue-600"
    },

    {
      icon: Sparkles,
      title: "AI-Powered",
      description:
        "Generate quality questions from PDFs, images, topics, and text within seconds.",
      bg: "bg-purple-50",
      color: "text-purple-600"
    },

    {
      icon: BarChart3,
      title: "Actionable Insights",
      description:
        "Understand performance through reports, analytics, and meaningful academic trends.",
      bg: "bg-green-50",
      color: "text-green-600"
    },

    {
      icon: Users,
      title: "Built For Educators",
      description:
        "Designed around the practical needs of teachers, coordinators, and institutions.",
      bg: "bg-orange-50",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-10 bg-slate-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="text-center max-w-3xl mx-auto">

          <div
            className="
            inline-flex
            px-4
            py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-6"
          >

            Why Schools Choose Us

          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >

            Why IndiaEduCore?

          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >

            We focus on solving one of the most time-consuming
            challenges in education—creating assessments and
            turning results into meaningful insights.

          </p>

        </div>


        {/* Cards */}
        <StaggerContainer>
        <div
          className="
          mt-10
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-8"
        >

          {items.map((item) => {

            const Icon = item.icon;

            return (
                <StaggerItem key={item.title}>
              <div
                
                className="
                group
                h-full
                bg-white
                border
                rounded-3xl
                p-8
                shadow-sm
                hover:shadow-xl
                transition-all
                duration-300"
              >

                <div
                  className={`
                  w-16
                  h-16
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

                <h3
                  className="
                  mt-6
                  text-2xl
                  font-bold
                  text-gray-900"
                >

                  {item.title}

                </h3>

                <p
                  className="
                  mt-4
                  text-gray-600
                  leading-relaxed"
                >

                  {item.description}

                </p>

              </div>
              </StaggerItem>

            );

          })}

        </div>

      </StaggerContainer>
        {/* Bottom Highlight */}

        <div
          className="
          mt-10
          rounded-3xl
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
          p-12
          text-center
          text-white"
        >

          <h3 className="text-3xl font-bold">

            Built To Empower Educators

          </h3>

          <p
            className="
            mt-5
            max-w-3xl
            mx-auto
            text-lg
            text-blue-100
            leading-relaxed"
          >

            IndiaEduCore combines AI-powered assessment creation,
            analytics, and academic insights to help institutions
            save time and improve learning outcomes.

          </p>

        </div>

      </div>
</Reveal>
    </section>
  );

}