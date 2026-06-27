import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import {
  Shield,
  Database,
  Lock,
  Globe,
  UserCheck,
  Mail
} from "lucide-react";
import Reveal from "../../components/common/Reveal";

export default function PrivacyPage() {

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      description:
        "We may collect names, email addresses, phone numbers, institution details, and assessment-related information required to provide our services."
    },

    {
      icon: UserCheck,
      title: "How We Use Information",
      description:
        "Information is used to operate the platform, improve services, provide support, generate analytics, and communicate with users."
    },

    {
      icon: Lock,
      title: "Data Security",
      description:
        "We implement appropriate technical and organizational measures to protect information from unauthorized access, misuse, or disclosure."
    },

    {
      icon: Globe,
      title: "Third-Party Services",
      description:
        "Certain features may rely on trusted third-party services for hosting, communication, analytics, or AI processing."
    },

    {
      icon: Shield,
      title: "Your Rights",
      description:
        "Users may request updates or corrections to their information and can contact us regarding privacy-related concerns."
    },

    {
      icon: Mail,
      title: "Contact Us",
      description:
        "For privacy-related questions or requests, please reach out through our Contact page or official support channels."
    }
  ];

  return (
    <>

    <SEO
      title="Privacy Policy | IndiaEduCore"
      url="/privacy"
    />
      <Navbar />

      {/* HERO */}

      <section className="bg-gradient-to-b from-blue-50 to-white pt-24">
        <Reveal>

        <div className="max-w-4xl mx-auto px-6 text-center mt-6">

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

            Privacy Policy

          </div>

          <h1
            className="
            text-5xl
            lg:text-6xl
            font-bold
            text-gray-900"
          >

            Your Data Matters

          </h1>

          <p
            className="
            mt-6
            text-xl
            text-gray-600
            leading-relaxed"
          >

            We are committed to protecting your information and
            maintaining transparency about how data is collected,
            used, and safeguarded.

          </p>

          <div className="mt-6 text-sm text-gray-500">

            Last Updated: June 2026

          </div>

        </div>

      </Reveal>
      </section>


      {/* CONTENT */}

      <section className="py-10 bg-white">
        <Reveal>

        <div className="max-w-6xl mx-auto px-6">

          <div className="grid md:grid-cols-2 gap-8">

            {sections.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
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
                    bg-blue-50
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

                  <h2
                    className="
                    mt-6
                    text-2xl
                    font-bold
                    text-gray-900"
                  >

                    {item.title}

                  </h2>

                  <p
                    className="
                    mt-4
                    text-gray-600
                    leading-relaxed"
                  >

                    {item.description}

                  </p>

                </div>

              );

            })}

          </div>

        </div>
</Reveal>
      </section>

      <Footer />
    </>
  );
}