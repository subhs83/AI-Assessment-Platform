import {
  Upload,
  Sparkles,
  ClipboardCheck,
  MonitorSmartphone,
  BarChart3,
  ArrowRight
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function WorkflowSection() {

  const steps = [
    {
      icon: Upload,
      title: "Upload Content",
      description:
        "Upload PDFs, images, or enter topics and text to begin creating assessments."
    },
    {
      icon: Sparkles,
      title: "AI Generates Questions",
      description:
        "AI instantly creates balanced and structured questions from your content."
    },
    {
      icon: ClipboardCheck,
      title: "Review Questions",
      description:
        "Teachers can review, edit, and finalize questions before publishing exams."
    },
    {
      icon: MonitorSmartphone,
      title: "Conduct Exams",
      description:
        "Run assessments smoothly and manage exams with ease."
    },
    {
      icon: BarChart3,
      title: "Analyze Results",
      description:
        "Track performance and gain meaningful academic insights."
    }
  ];

  return (
    <section className="py-10 bg-white">
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
            bg-purple-100
            text-purple-700
            font-medium
            mb-6">

            <Sparkles size={18} />

            How It Works

          </div>

          <h2 className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900">

            From Content to Insights in Minutes

          </h2>

          <p className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed">

            IndiaEduCore streamlines the entire assessment journey —
            from AI question generation to actionable analytics.

          </p>

        </div>


        {/* Workflow Cards */}
        <StaggerContainer>
        <div className="
          mt-10
          grid
          md:grid-cols-2
          xl:grid-cols-5
          gap-8">

          {steps.map((step, index) => {

            const Icon = step.icon;

            return (
                <StaggerItem key={step.title}>
              <div
                
                className="
                  group
                  relative
                  bg-white
                  border
                  rounded-3xl
                  p-8
                  shadow-sm
                  hover:shadow-xl
                  transition
                  h-full
                  flex
                  flex-col">

                {/* Connector */}

                {index < steps.length - 1 && (

                  <div className="
                    hidden
                    xl:flex
                    absolute
                    top-16
                    -right-8
                    z-10">

                    <ArrowRight
                      size={20}
                      className="text-purple-300"
                    />

                  </div>

                )}

                {/* Icon */}

                <div className="
                  relative
                  w-16
                  h-16
                  rounded-2xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-600
                  mx-auto
                  transition-transform
                  duration-300
                  group-hover:rotate-6"
                  >

                  <Icon size={28} />

                  {/* Step Number */}

                  <div className="
                    absolute
                    -top-2
                    -right-2
                    h-6
                    w-6
                    rounded-full
                    bg-purple-600
                    text-white
                    text-xs
                    font-bold
                    flex
                    items-center
                    justify-center">

                    {index + 1}

                  </div>

                </div>

                <h3 className="
                  mt-8
                  text-xl
                  font-bold
                  text-gray-900
                  text-center">

                  {step.title}

                </h3>

                <p className="
                  mt-4
                  text-gray-600
                  leading-relaxed
                  text-center
                  flex-grow">

                  {step.description}

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
          from-purple-600
          to-indigo-600
          p-12
          text-center
          text-white">

          <h3 className="
            text-3xl
            font-bold">

            A Complete AI-Powered Assessment Workflow

          </h3>

          <p className="
            mt-5
            max-w-3xl
            mx-auto
            text-lg
            text-purple-100
            leading-relaxed">

            Save hours of manual work, conduct smarter assessments,
            and gain meaningful insights through a streamlined workflow
            built for modern education.

          </p>

        </div>

      </div>
</Reveal>
    </section>
  );
}