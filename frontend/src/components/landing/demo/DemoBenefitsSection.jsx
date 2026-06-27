import {
  Sparkles,
  Clock,
  BarChart3,
  Users
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function DemoBenefitsSection() {

  const benefits = [
    {
      icon: Sparkles,
      title: "AI Question Generation",
      description:
        "Generate high-quality assessments from PDFs, images, topics, and text."
    },
    {
      icon: Clock,
      title: "Save Hours Of Manual Work",
      description:
        "Reduce question creation time and focus more on teaching and learning."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Gain insights into student progress with reports and analytics."
    },
    {
      icon: Users,
      title: "School-Wide Management",
      description:
        "Manage teachers, exams, and academic activities from one platform."
    }
  ];

  return (
    <section className="py-12 bg-white">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6 mt-6">

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

            Why Schools Choose IndiaEduCore

          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >

            See What You'll Experience In The Demo

          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >

            Discover how AI-powered assessments simplify exam creation,
            improve academic outcomes, and save valuable time.

          </p>

        </div>

        {/* Cards */}
        <StaggerContainer>

        <div className="
          mt-10
          grid
          md:grid-cols-2
          lg:grid-cols-4
          gap-8">

          {benefits.map((item) => {

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
                  className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-blue-100
                  text-blue-600
                  flex
                  items-center
                  justify-center
                  transition-transform
                  duration-300
                  group-hover:rotate-6"
                >

                  <Icon size={30} />

                </div>

                <h3
                  className="
                  mt-6
                  text-xl
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