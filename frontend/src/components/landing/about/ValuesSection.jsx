import {
  Sparkles,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Layers3,
  Handshake
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function ValuesSection() {

  const values = [
    {
      icon: Sparkles,
      title: "Innovation Through AI",
      description:
        "We embrace AI to simplify assessments and unlock new possibilities for educators.",
      bg: "bg-blue-50",
      color: "text-blue-600"
    },

    {
      icon: GraduationCap,
      title: "Educator-First Design",
      description:
        "Every feature is designed around the real needs of teachers and institutions.",
      bg: "bg-green-50",
      color: "text-green-600"
    },

    {
      icon: TrendingUp,
      title: "Continuous Improvement",
      description:
        "We continuously evolve our platform to deliver better academic outcomes.",
      bg: "bg-purple-50",
      color: "text-purple-600"
    },

    {
      icon: BarChart3,
      title: "Data-Driven Decisions",
      description:
        "Insights and analytics help educators make smarter academic decisions.",
      bg: "bg-orange-50",
      color: "text-orange-600"
    },

    {
      icon: Layers3,
      title: "Simplicity & Usability",
      description:
        "Powerful technology should remain intuitive, simple, and easy to adopt.",
      bg: "bg-cyan-50",
      color: "text-cyan-600"
    },

    {
      icon: Handshake,
      title: "Long-Term Partnerships",
      description:
        "We aim to grow alongside schools and institutions through trust and collaboration.",
      bg: "bg-indigo-50",
      color: "text-indigo-600"
    }
  ];

  return (
    <section className="py-10 bg-white">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="text-center max-w-3xl mx-auto">

          <div
            className="
            inline-flex
            px-4 py-2
            rounded-full
            bg-indigo-100
            text-indigo-700
            font-medium
            mb-6"
          >

            Our Values

          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >

            Principles That Guide Everything We Build

          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >

            Our mission goes beyond technology. These values shape
            how we design products and support educators.

          </p>

        </div>


        {/* Cards */}
        <StaggerContainer>
        <div
          className="
          mt-10
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-8"
        >

          {values.map((item) => {

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

      </div>
</Reveal>
    </section>
  );
}