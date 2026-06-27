import {
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function ContactInfoSection() {

  const items = [
    {
      icon: Mail,
      title: "Email",
      value: "info@indiaeducore.com",
      href: "mailto:info@indiaeducore.com",
      description: "Send us your questions anytime."
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+91 XXXXX XXXXX",
      href: "tel:+91XXXXXXXXXX",
      description: "Speak with our team directly."
    },
    {
      icon: MapPin,
      title: "Location",
      value: "India",
      description: "Serving schools and institutions nationwide."
    }
  ];

  return (
    <section className="py-12 bg-white">
      <Reveal>

      <div className="max-w-6xl mx-auto px-6">

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

            Contact Information

          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >

            Get In Touch

          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >

            We'd be happy to answer your questions and help you
            explore how IndiaEduCore can support your institution.

          </p>

        </div>

        {/* Cards */}
        <StaggerContainer>

        <div className="mt-10 grid md:grid-cols-3 gap-8">

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
                text-center
                shadow-sm
                hover:shadow-xl
                transition-all
                duration-300"
              >

                <div
                  className="
                  w-16
                  h-16
                  mx-auto
                  rounded-2xl
                  bg-blue-100
                  flex
                  items-center
                  justify-center
                  text-blue-600
                  transition-transform
                  duration-300
                  group-hover:rotate-6"
                >

                  <Icon size={30} />

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

                {item.href ? (
                  <a
                    href={item.href}
                    className="
                    mt-4
                    block
                    text-lg
                    font-medium
                    text-blue-600
                    hover:text-blue-700"
                  >

                    {item.value}

                  </a>
                ) : (
                  <p
                    className="
                    mt-4
                    text-lg
                    font-medium
                    text-gray-800"
                  >

                    {item.value}

                  </p>
                )}

                <p
                  className="
                  mt-3
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