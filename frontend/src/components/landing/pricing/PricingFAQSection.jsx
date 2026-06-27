import { HelpCircle } from "lucide-react";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function PricingFAQSection() {
  const faqs = [
    {
      q: "How is pricing determined?",
      a: "Pricing depends on institution size, expected usage, number of teachers, and feature requirements."
    },
    {
      q: "Is AI question generation included?",
      a: "Yes. AI-powered question generation is included in all plans."
    },
    {
      q: "Do you offer onboarding support?",
      a: "Yes. We provide onboarding assistance, setup guidance, and teacher training."
    },
    {
      q: "Can pricing be customized?",
      a: "Absolutely. We provide tailored solutions for schools, coaching centers, and institutions of different sizes."
    }
  ];

  return (
    <section className="py-10 bg-slate-50">
      <Reveal>

      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}

        <div className="text-center max-w-4xl mx-auto">

          <div className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-6">

            <HelpCircle size={18} />

            Frequently Asked Questions

          </div>

          <h2 className="
            text-4xl
            
            lg:text-5xl
            font-bold
            text-gray-900">

            Common Questions About Pricing

          </h2>

          <p className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed">

            Need more details? We provide flexible plans and can customize
            pricing based on your institution's requirements.

          </p>

        </div>

        {/* FAQ Cards */}
        <StaggerContainer>
        <div className="
          mt-10
          grid
          md:grid-cols-2
          gap-8">

          {faqs.map((faq) => (
            <StaggerItem key={faq.q}>

            <div
              
              className="
                h-full
                bg-white
                border
                rounded-3xl
                p-8
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300"
            >

              <h3 className="
                text-xl
                font-bold
                text-gray-900">

                {faq.q}

              </h3>

              <p className="
                mt-4
                text-gray-600
                leading-relaxed">

                {faq.a}

              </p>

            </div>
            </StaggerItem>

          ))}

        </div>
        </StaggerContainer>

      </div>
</Reveal>
    </section>
  );
}