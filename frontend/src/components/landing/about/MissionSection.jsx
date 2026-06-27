import {
  Target,
  Rocket,
  Sparkles
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function MissionSection() {

  const items = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To simplify assessment creation and academic evaluation through AI-powered technology that empowers educators and improves learning outcomes.",
      bg: "bg-blue-50",
      color: "text-blue-600"
    },

    {
      icon: Rocket,
      title: "Our Vision",
      description:
        "To become the preferred AI assessment platform for schools, institutions, and educators seeking smarter, faster, and more effective academic evaluation.",
      bg: "bg-green-50",
      color: "text-green-600"
    }
  ];

  return (
    <section className="py-12 bg-white">
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
            bg-indigo-100
            text-indigo-700
            font-medium
            mb-6"
          >

            <Sparkles size={18} />

            Why We Exist

          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >

            Building The Future Of Assessments

          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >

            Our purpose is to help educators save time, improve
            academic outcomes, and make better decisions through
            intelligent assessment technology.

          </p>

        </div>


        {/* Cards */}
        <StaggerContainer>
        <div className="mt-10 grid lg:grid-cols-2 gap-8">

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
                p-10
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
                  mt-8
                  text-3xl
                  font-bold
                  text-gray-900"
                >

                  {item.title}

                </h3>

                <p
                  className="
                  mt-5
                  text-gray-600
                  leading-relaxed
                  text-lg"
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