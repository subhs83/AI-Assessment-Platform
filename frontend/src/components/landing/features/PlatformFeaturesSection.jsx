import {
  FileCheck,
  ClipboardPen,
  BarChart3,
  Trophy,
  Users,
  Building2,
  CheckCircle2
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";
import Counter from "../../common/Counter";

export default function PlatformFeaturesSection() {
  const features = [
    {
      icon: FileCheck,
      title: "Smart Exam Creation",
      description:
        "Create and organize assessments with flexible workflows and scheduling.",
      bg: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      icon: ClipboardPen,
      title: "Review Questions",
      description:
        "Review, edit, and finalize AI-generated questions before publishing.",
      bg: "bg-green-100",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Understand outcomes with reports, insights, and detailed analysis.",
      bg: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description:
        "Recognize top performers and encourage healthy competition.",
      bg: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      icon: Users,
      title: "Teacher Management",
      description:
        "Coordinate academic activities and manage teaching teams efficiently.",
      bg: "bg-cyan-100",
      color: "text-cyan-600"
    },
    {
      icon: Building2,
      title: "Multi-School Ready",
      description:
        "Scale seamlessly across schools and institutions from one platform.",
      bg: "bg-orange-100",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-10 bg-slate-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium mb-6">
            Platform Features
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Everything You Need To Conduct Smarter Assessments
          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            From question review to analytics and teacher management,
            IndiaEduCore provides a complete assessment ecosystem.
          </p>

        </div>

        {/* Cards */}
        <StaggerContainer>
        <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (
              <StaggerItem key={feature.title}>
              <div                
                className="
                group
                h-full
                flex
                flex-col
                bg-white
                border
                rounded-3xl
                p-8
                shadow-sm
                hover:-translate-y-1
                hover:shadow-xl
                transition"
              >

                <div className="flex justify-center mb-7">

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
                    ${feature.bg}
                  `}
                  >

                    <Icon
                      size={30}
                      className={feature.color}
                    />

                  </div>

                </div>

                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  {feature.title}
                </h3>

                <p className="mt-4 text-gray-600 leading-relaxed text-center flex-1">
                  {feature.description}
                </p>

                <div className="mt-8 flex justify-center items-center gap-2 text-sm font-medium text-green-600">

                  <CheckCircle2 size={18} />

                  Included

                </div>

              </div>
          </StaggerItem>
            );

          })}

        </div>
        </StaggerContainer>

        {/* Bottom Banner */}

        <div className="mt-10 rounded-[2rem] overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-10 py-14 text-center text-white">

          <h3 className="text-3xl lg:text-4xl font-bold">
            Built For Modern Educational Institutions
          </h3>

          <p className="mt-6 text-lg text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            Simplify exam creation, improve assessment quality,
            and empower educators with an intelligent cloud-based platform.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-10">

            <div>
              <div className="text-3xl font-bold">
                <Counter
                  end={"100"}
                  suffix="+"
                  enableScrollSpy
                />
                </div>
              <div className="text-indigo-100 mt-2">
                Teachers Supported
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold">
                <Counter
                  end={"1000"}
                  suffix="+"
                  enableScrollSpy
                />
                </div>
              <div className="text-indigo-100 mt-2">
                Exams Conducted
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold">Cloud</div>
              <div className="text-indigo-100 mt-2">
                Accessible Anywhere
              </div>
            </div>

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );
}