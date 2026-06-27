import {
  Clock3,
  Brain,
  BarChart3,
  CheckCircle
} from "lucide-react";
import Reveal from "../common/Reveal";

export default function TeacherBenefitsSection() {

  const benefits = [
    {
      icon: Clock3,
      title: "Save Hours Every Week",
      description:
        "Reduce manual work and create assessments in minutes instead of hours.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },

    {
      icon: Brain,
      title: "AI-Assisted Assessment",
      description:
        "Generate questions from PDFs, images, topics, and text with intelligent assistance.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },

    {
      icon: BarChart3,
      title: "Actionable Insights",
      description:
        "Understand student performance and identify learning gaps with analytics.",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <section className="py-10 bg-gray-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="max-w-3xl mx-auto text-center">

          <div
            className="
            inline-flex
            px-4 py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-6"
          >
            Why Teachers Love IndiaEduCore
          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >
            Built to Make Teaching Easier
          </h2>

          <p
            className="
            mt-4
            text-lg
            text-gray-600
            leading-relaxed"
          >
            Spend less time creating assessments and more time helping students succeed.
          </p>

        </div>


        {/* Layout */}

        <div className="mt-10 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}

          <div className="space-y-8">

            {benefits.map((item, index) => {

              const Icon = item.icon;

              return (

                <div
                  key={index}
                  className="
                  bg-white
                  rounded-3xl
                  border
                  p-8
                  shadow-sm
                  hover:shadow-xl
                  transition"
                >

                  <div className="flex gap-5 group">

                    <div
                      className={`
                      h-16
                      w-16
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      shrink-0
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

                    <div>

                      <h3 className="text-2xl font-bold text-gray-900">

                        {item.title}

                      </h3>

                      <p className="mt-3 text-gray-600 leading-relaxed">

                        {item.description}

                      </p>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>


          {/* Right */}

          <div
            className="
            bg-gradient-to-br
            from-blue-600
            to-indigo-700
            rounded-[32px]
            p-10
            text-white"
          >

            <div className="text-3xl font-bold">

              Focus on Teaching,
              <br />
              Not Administrative Work.

            </div>

            <p className="mt-6 text-blue-100 leading-relaxed">

              IndiaEduCore helps educators streamline assessments,
              automate repetitive tasks, and make better academic decisions.

            </p>

            <div className="space-y-5 mt-10">

              <div className="flex items-center gap-3">

                <CheckCircle size={18} />

                AI Question Generation

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle size={18} />

                Smart Exam Creation

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle size={18} />

                Performance Analytics

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle size={18} />

                Multi-School Platform

              </div>

            </div>

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );

}