import { MessageSquare } from "lucide-react";
import Reveal from "../../common/Reveal";

export default function ContactHeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-white pt-24">
      <Reveal>

      <div className="max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}

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

          <MessageSquare size={18} />

          Contact Us

        </div>

        {/* Heading */}

        <h1
          className="
          text-5xl
          lg:text-6xl
          font-bold
          text-gray-900
          leading-tight"
        >

          Let's Talk About
          <span className="block text-blue-600">

            Smarter Assessments

          </span>

        </h1>

        {/* Description */}

        <p
          className="
          mt-8
          text-xl
          text-gray-600
          leading-relaxed
          max-w-3xl
          mx-auto"
        >

          Have questions about IndiaEduCore or want to explore how AI-powered
          assessments can benefit your institution? Our team is here to help.

        </p>

        {/* Trust Line */}

        <div
          className="
          mt-10
          flex
          flex-wrap
          justify-center
          gap-8
          text-sm
          text-gray-500"
        >

          <span>✓ Quick Response</span>

          <span>✓ Personalized Demo</span>

          <span>✓ Dedicated Support</span>

        </div>

      </div>
</Reveal>
    </section>
  );
}