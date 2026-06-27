import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import {
  FileText,
  Shield,
  Copyright,
  Server,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import Reveal from "../../components/common/Reveal";

export default function TermsPage() {

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      description:
        "By accessing or using IndiaEduCore, you agree to comply with these terms and all applicable laws and regulations."
    },

    {
      icon: Shield,
      title: "Platform Usage",
      description:
        "Users are responsible for maintaining account security and ensuring that platform usage complies with institutional policies and applicable regulations."
    },

    {
      icon: Copyright,
      title: "Intellectual Property",
      description:
        "All software, branding, content, and technology provided through IndiaEduCore remain the property of IndiaEduCore unless otherwise stated."
    },

    {
      icon: Server,
      title: "Service Availability",
      description:
        "We strive to provide reliable and secure services, but uninterrupted availability cannot be guaranteed at all times."
    },

    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      description:
        "IndiaEduCore shall not be liable for indirect, incidental, or consequential damages arising from the use of the platform."
    },

    {
      icon: FileText,
      title: "Changes to Terms",
      description:
        "We may update these terms from time to time. Continued use of the platform after changes are published constitutes acceptance of the revised terms."
    }
  ];

  return (
    <>

      <SEO
        title="Terms of Service | IndiaEduCore"
        url="/terms"
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
            Terms of Service
          </div>

          <h1
            className="
            text-5xl
            lg:text-6xl
            font-bold
            text-gray-900"
          >
            Terms & Conditions
          </h1>

          <p
            className="
            mt-6
            text-xl
            text-gray-600
            leading-relaxed"
          >
            These terms govern the use of IndiaEduCore and help
            ensure a secure, reliable, and responsible experience
            for schools, teachers, and institutions.
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