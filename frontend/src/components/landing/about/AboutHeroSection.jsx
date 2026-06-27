import {
  Sparkles,
  Clock3,
  BarChart3,
  GraduationCap
} from "lucide-react";
import Reveal from "../../common/Reveal";

export default function AboutHeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-24">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6 mt-6">

        <div className="grid lg:grid-cols-2 gap-16 items-start">

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

              About IndiaEduCore

            </div>

            <h1
              className="
              text-5xl
              lg:text-6xl
              font-bold
              text-gray-900
              leading-tight"
            >

              Reimagining
              <span className="text-blue-600">
                {" "}Assessments{" "}
              </span>
              With AI

            </h1>

            <p
              className="
              mt-8
              text-xl
              text-gray-600
              leading-relaxed"
            >

              IndiaEduCore is an AI-powered assessment platform
              built to help educators create smarter assessments,
              save valuable time, and gain meaningful academic insights.

            </p>

            <p
              className="
              mt-6
              text-lg
              text-gray-600
              leading-relaxed"
            >

              Our mission is to simplify exam workflows and empower
              schools with intelligent tools that improve learning outcomes.

            </p>

          </div>


          {/* RIGHT */}

          <div className="grid sm:grid-cols-2 gap-6">

            <div className="bg-white border rounded-3xl p-8 shadow-sm">

              <div className="
              w-14
              h-14
              rounded-2xl
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center">

                <Clock3 size={28} />

              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">

                Save Time

              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">

                Reduce hours of manual assessment work with AI assistance.

              </p>

            </div>


            <div className="bg-white border rounded-3xl p-8 shadow-sm">

              <div className="
              w-14
              h-14
              rounded-2xl
              bg-green-50
              text-green-600
              flex
              items-center
              justify-center">

                <BarChart3 size={28} />

              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">

                Better Insights

              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">

                Understand academic performance with analytics and reports.

              </p>

            </div>


            <div className="bg-white border rounded-3xl p-8 shadow-sm">

              <div className="
              w-14
              h-14
              rounded-2xl
              bg-purple-50
              text-purple-600
              flex
              items-center
              justify-center">

                <GraduationCap size={28} />

              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">

                Better Learning

              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">

                Support improved outcomes through smarter assessments.

              </p>

            </div>


            <div className="bg-white border rounded-3xl p-8 shadow-sm">

              <div className="
              w-14
              h-14
              rounded-2xl
              bg-orange-50
              text-orange-600
              flex
              items-center
              justify-center">

                <Sparkles size={28} />

              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">

                AI Powered

              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">

                Transform content into assessments with intelligent automation.

              </p>

            </div>

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );
}