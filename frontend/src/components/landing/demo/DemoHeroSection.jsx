import {
  CalendarCheck,
  CheckCircle
} from "lucide-react";
import Reveal from "../../common/Reveal";

export default function DemoHeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-white pt-24">
      <Reveal>

      <div className="max-w-5xl mx-auto px-6 text-center mt-4">

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

          <CalendarCheck size={18} />

          Book A Free Demo

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

          Experience
          <span className="block text-blue-600">

            IndiaEduCore In Action

          </span>

        </h1>

        {/* Description */}

        <p
          className="
          mt-4
          text-xl
          text-gray-600
          leading-relaxed
          max-w-3xl
          mx-auto"
        >

          Discover how AI-powered question generation, online exams,
          analytics, and reports can simplify assessments and improve
          learning outcomes for your institution.

        </p>

        {/* Trust Points */}

        <div
          className="
          mt-6
          flex
          flex-wrap
          justify-center
          gap-8
          text-sm
          text-gray-500"
        >

          <div className="flex items-center gap-2">

            <CheckCircle size={16} className="text-green-600" />

            Free Personalized Demo

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle size={16} className="text-green-600" />

            No Commitment Required

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle size={16} className="text-green-600" />

            Quick Setup Guidance

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );
}