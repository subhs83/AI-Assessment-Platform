import {
  FileText,
  Image,
  BookOpen,
  Upload,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer"
import StaggerItem from "../../common/StaggerItem"
import Counter from "../../common/Counter";

export default function AIQuestionSection() {
  const features = [
    {
      icon: FileText,
      title: "PDF → Questions",
      description:
        "Upload chapters, notes, and study material to generate high-quality MCQs instantly.",
      bg: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      icon: Image,
      title: "Image → Questions",
      description:
        "Convert handwritten notes, screenshots, and images into structured assessments.",
      bg: "bg-green-100",
      color: "text-green-600"
    },
    {
      icon: BookOpen,
      title: "Topic → Questions",
      description:
        "Generate balanced and intelligent question sets from any topic in seconds.",
      bg: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      icon: Upload,
      title: "Upload Your Own Questions",
      description:
        "Import your own question sets and combine them with AI-assisted workflows.",
      bg: "bg-orange-100",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-10 bg-white">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="text-center max-w-4xl mx-auto">

          <div
            className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-6"
          >
            <Sparkles size={18} />

            AI Question Generation

          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >
            Create Assessments From Any Content
          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >
            Generate questions from PDFs, images, topics, or your own
            question banks. Save hours of manual work and focus more on teaching.
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

          {features.map((feature) => {

            const Icon = feature.icon;

            return (
              <StaggerItem key={feature.title}>
              <div
                className="
                group
                h-full
                flex
                justify-center
                flex-col
                bg-white
                border
                rounded-3xl
                p-6
                shadow-sm
                hover:-translate-y-1
                hover:shadow-xl
                transition"
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
                  ${feature.bg}
                `}
                >

                  <Icon
                    size={30}
                    className={feature.color}
                  />

                </div>

                <h3
                  className="
                  mt-7
                  text-2xl
                  font-bold
                  text-gray-900"
                >
                  {feature.title}
                </h3>

                <p
                  className="
                  mt-4
                  text-gray-600
                  leading-relaxed
                  flex-1"
                >
                  {feature.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-green-600">

                  <CheckCircle2 size={18} />

                  Ready in seconds

                </div>

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
          rounded-[2rem]
          overflow-hidden
          bg-gradient-to-r
          from-blue-600
          via-indigo-600
          to-purple-600
          px-10
          py-14
          text-center
          text-white"
        >

          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">

            <Sparkles size={18} />

            AI Assisted Workflow

          </div>

          <h3 className="text-3xl lg:text-4xl font-bold">

            Create High-Quality Assessments In Minutes

          </h3>

          <p
            className="
            mt-6
            text-lg
            text-blue-100
            max-w-3xl
            mx-auto
            leading-relaxed"
          >
            Generate questions faster, review them before publishing,
            and maintain complete control over your assessments.
            AI helps you save time without compromising quality.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-8">

            <div>

              <div className="text-3xl font-bold">

                <Counter
                        end={"10000"}
                        suffix="+"
                        enableScrollSpy
                      />

              </div>

              <div className="text-blue-100 mt-2">

                Questions Generated

              </div>

            </div>

            <div>

              <div className="text-3xl font-bold">

                <Counter
                        end={"95"}
                        suffix="%"
                        enableScrollSpy
                      />

              </div>

              <div className="text-blue-100 mt-2">

                AI Accuracy

              </div>

            </div>

            <div>

              <div className="text-3xl font-bold">

                Minutes

              </div>

              <div className="text-blue-100 mt-2">

                Instead of Hours

              </div>

            </div>

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );
}