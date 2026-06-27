import {
  FileSpreadsheet,
  BarChart3,
  Trophy,
  Users,
  Cloud,
  Building2,
  ArrowRight
} from "lucide-react";
import Reveal from "../common/Reveal";
import StaggerContainer from "../common/StaggerContainer";
import StaggerItem from "../common/StaggerItem";

export default function FeaturesSection() {

  const features = [
    {
      icon: FileSpreadsheet,
      title: "Exam Creation & Publishing",
      description:
        "Create, schedule, and publish assessments with flexible settings and multiple attempts.",
      bg: "bg-blue-50",
      color: "text-blue-600"
    },

    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Track outcomes, identify learning gaps, and gain actionable academic insights.",
      bg: "bg-green-50",
      color: "text-green-600"
    },

    {
      icon: Trophy,
      title: "Leaderboards & Rankings",
      description:
        "Recognize top performers and encourage healthy academic competition.",
      bg: "bg-yellow-50",
      color: "text-yellow-600"
    },

    {
      icon: Users,
      title: "Teacher Workspace",
      description:
        "Empower educators with tools for assessment, review, and academic management.",
      bg: "bg-purple-50",
      color: "text-purple-600"
    },

    {
      icon: Cloud,
      title: "Secure Cloud Access",
      description:
        "Access your platform from anywhere with reliable and secure infrastructure.",
      bg: "bg-cyan-50",
      color: "text-cyan-600"
    },

    {
      icon: Building2,
      title: "Multi-Institution Ready",
      description:
        "Designed to scale across schools and educational organizations.",
      bg: "bg-orange-50",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-12 bg-white">
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
            Platform Capabilities
          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >
            Built for Modern Assessment Workflows
          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >
            Conduct exams, monitor performance, and streamline academic
            workflows with tools designed for schools and educators.
          </p>

        </div>


        {/* Cards */}
        <StaggerContainer>

        <div
          className="
          mt-10
          grid
          md:grid-cols-2
          lg:grid-cols-3
          gap-8"

>

          {features.map((item, index) => {

            const Icon = item.icon;

            return (
              <StaggerItem key={index}> 

              <div
                
                className="
                group
                bg-white
                border
                rounded-3xl
                p-8
                h-full
                shadow-sm
                hover:shadow-2xl
                hover:-translate-y-1
                transition-all
                duration-300"
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
                  ${item.bg}`}
                >

                  <Icon
                    size={30}
                    className={item.color}
                  />

                </div>

                <h3
                  className="
                  mt-8
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

                <div className="
                  mt-4
                  pt-6
                  border-t
                  flex items-center gap-2
                  text-sm
                  text-green-600">

                  ✓ Available Out of the Box

                  </div>

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