import {
  Upload,
  Sparkles,
  FileCheck,
  MonitorCheck,
  BarChart3
} from "lucide-react";
import Reveal from "../common/Reveal";
import StaggerContainer from "../common/StaggerContainer";
import StaggerItem from "../common/StaggerItem";

export default function HowItWorksSection() {

  const steps = [
    {
      icon: Upload,
      title: "Upload Content",
      description:
        "Upload PDFs, images, notes, or simply enter a topic or text.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },

    {
      icon: Sparkles,
      title: "AI Generates Questions",
      description:
        "AI instantly creates balanced and ready-to-use assessments.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },

    {
      icon: FileCheck,
      title: "Review & Edit",
      description:
        "Teachers can review, modify, and finalize generated questions.",
      color: "text-green-600",
      bg: "bg-green-50"
    },

    {
      icon: MonitorCheck,
      title: "Conduct Exams",
      description:
        "Run assessments and manage exams with ease.",
      color: "text-orange-600",
      bg: "bg-orange-50"
    },

    {
      icon: BarChart3,
      title: "Analyze Results",
      description:
        "Gain insights with reports, analytics, and leaderboards.",
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="text-center max-w-3xl mx-auto">

          <div
            className="
            inline-flex
            px-4 py-1
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-6"
          >
            Simple Workflow
          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >
            From Content to Insights
          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >
            Create assessments faster with AI and transform results into
            meaningful academic insights.
          </p>

        </div>


        {/* Timeline */}

        <div className="mt-12 relative">

          {/* Horizontal line */}

          <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gray-200"></div>
          <StaggerContainer>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 relative items-stretch">

            {steps.map((step, index) => {

              const Icon = step.icon;

              return (
                <StaggerItem key={index}>
                <div
                  
                  className="text-center relative"
                >

                  {/* Number */}

                  <div className="mb-6 ">

                    <div
                      className="
                      h-10
                      w-10
                      rounded-full
                      bg-blue-600
                      text-white
                      font-bold
                      flex
                      items-center
                      justify-center
                      mx-auto
                      relative
                      z-10"
                    >
                      {index + 1}
                    </div>

                  </div>

                  {/* Card */}

                  <div
                    className="
                    group
                    h-full
                    min-h-[300px]
                    bg-white
                    border
                    rounded-3xl
                    p-6
                    shadow-sm
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition-all
                    duration-300
                    flex
                    flex-col"
                  >

                    <div
                      className={`
                      h-16
                      w-16
                      rounded-2xl
                      mx-auto
                      flex
                      items-center
                      justify-center
                      hover:shadow-xl
                      transition-all
                      duration-300
                      ${step.bg}`}
                    >
                      <Icon
                        size={30}
                        className={step.color}
                      />
                    </div>

                    <h3
                      className="
                      mt-6
                      text-xl
                      font-bold
                      text-gray-900"
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                      mt-4
                      text-gray-600
                      leading-relaxed
                      flex-1"
                    >
                      {step.description}
                    </p>

                  </div>

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