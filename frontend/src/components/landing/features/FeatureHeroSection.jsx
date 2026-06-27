import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Image,
  BookOpen,
  BarChart3,
} from "lucide-react";

import FeaturePreviewCard from "./FeaturePreviewCard";
import Reveal from "../../common/Reveal";

export default function FeatureHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-10">
      <Reveal>

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-200/30 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}

          <div>

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
              mb-8"
            >
              <Sparkles size={18} />

              AI-Powered Features

            </div>

            <h1
              className="
              text-5xl
              lg:text-6xl
              font-bold
              text-gray-900
              leading-tight"
            >
              Transform Content
              <br />

              Into Assessments

              <span className="block text-blue-600">
                With AI
              </span>

            </h1>

            <p
              className="
              mt-8
              text-xl
              text-gray-600
              leading-relaxed"
            >
              Generate questions from PDFs, images, topics, and text.
              Conduct exams, analyze performance, and simplify academic
              workflows from one intelligent platform.
            </p>

            {/* Buttons */}

            <div className="flex flex-wrap gap-4 mt-10">

              <Link
                to="/demo"
                className="
                px-8
                py-4
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                shadow-lg"
              >
                Book Free Demo
              </Link>

              <Link
                to="/contact"
                className="
                px-8
                py-4
                rounded-xl
                border
                bg-white
                hover:bg-gray-50
                font-semibold"
              >
                Talk to Our Team
              </Link>

            </div>

            {/* Feature Pills */}

            <div className="flex flex-wrap gap-3 mt-10">

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">
                <FileText size={16} className="text-blue-600" />
                PDF → Questions
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">
                <Image size={16} className="text-blue-600" />
                Image → Questions
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">
                <BookOpen size={16} className="text-blue-600" />
                Topic → Questions
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">
                <BarChart3 size={16} className="text-blue-600" />
                Analytics
              </div>

            </div>

          </div>


          {/* RIGHT */}

          <div className="relative">

            <div
              className="
              absolute
              inset-0
              bg-blue-200/30
              blur-3xl
              rounded-full
              scale-110"
            />

            <div className="relative">

              <FeaturePreviewCard />

            </div>

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );
}