import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  CalendarDays,
  MessageCircle
} from "lucide-react";
import Reveal from "../common/Reveal"

export default function CTASection() {
  return (
    <section className="py-10">
      <Reveal>
      <div className="max-w-7xl mx-auto px-6">

        <div
          className="
          relative
          overflow-hidden
          rounded-[2.5rem]
          bg-gradient-to-br
          from-blue-600
          via-indigo-600
          to-purple-700
          px-8
          lg:px-16
          py-20
          text-center
          text-white
          shadow-2xl"
        >

          {/* Background Glow */}

          <div className="absolute -top-20 -left-20 h-72 w-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 bg-purple-400/20 rounded-full blur-3xl" />

          <div className="relative">

            {/* Badge */}

            <div
              className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-white/10
              backdrop-blur
              border border-white/20
              mb-8"
            >
              <Sparkles size={18} />

              AI-Powered Assessment Platform

            </div>

            {/* Heading */}

            <h2
              className="
              text-4xl
              lg:text-6xl
              font-bold
              leading-tight"
            >
              Ready to Modernize
              <br />

              Assessments with AI?

            </h2>

            {/* Subtitle */}

            <p
              className="
              max-w-3xl
              mx-auto
              mt-8
              text-lg
              text-blue-100
              leading-relaxed"
            >
              Generate questions from PDFs, images, topics, and text.
              Conduct exams, analyze performance, and empower educators
              with smarter academic insights.
            </p>

            {/* Buttons */}

            <div
              className="
              mt-12
              flex
              flex-wrap
              justify-center
              gap-5"
            >

              <Link
                to="/demo"
                className="
                inline-flex
                items-center
                gap-2
                px-8
                py-4
                rounded-2xl
                bg-white
                text-blue-700
                font-semibold
                hover:bg-blue-50
                transition"
              >

                <CalendarDays size={18} />

                Book Free Demo

                <ArrowRight size={18} />

              </Link>

              <Link
                to="/contact"
                className="
                inline-flex
                items-center
                gap-2
                px-8
                py-4
                rounded-2xl
                border
                border-white/30
                bg-white/10
                backdrop-blur
                font-semibold
                hover:bg-white/20
                transition"
              >

                <MessageCircle size={18} />

                Talk to Our Team

              </Link>

            </div>

            {/* Trust Points */}

            <div
              className="
              mt-14
              flex
              flex-wrap
              justify-center
              gap-4"
            >

              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                ✓ AI Question Generation
              </div>

              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                ✓ Smart Exams
              </div>

              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                ✓ Analytics & Reports
              </div>

              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                ✓ Multi-School Ready
              </div>

            </div>

          </div>

        </div>

      </div>
      </Reveal>

    </section>
  );
}