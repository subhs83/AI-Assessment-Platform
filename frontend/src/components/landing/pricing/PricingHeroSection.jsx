import {
  Sparkles,
  ShieldCheck,
  Cloud,
  Headphones
} from "lucide-react";
import Reveal from "../../common/Reveal";

export default function PricingHeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-white pt-20">
      <Reveal>

      <div className="max-w-6xl mx-auto px-6 text-center mt-6">

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
          mb-8"
        >

          <Sparkles size={18} />

          Simple & Flexible Pricing

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

          Flexible Pricing
          <br />

          For Every Institution

        </h1>

        {/* Subtitle */}

        <p
          className="
          mt-8
          text-xl
          text-gray-600
          leading-relaxed
          max-w-3xl
          mx-auto"
        >

          Start small and scale as your needs grow. Whether you're an
          individual teacher, a school, or a large institution,
          IndiaEduCore provides plans designed for every stage.

        </p>

        {/* Trust Points */}

        <div className="mt-14 grid md:grid-cols-3 gap-6">

          <div className="flex items-center justify-center gap-3">

            <ShieldCheck
              size={20}
              className="text-green-600"
            />

            <span className="text-gray-700 font-medium">
              No Setup Fees
            </span>

          </div>

          <div className="flex items-center justify-center gap-3">

            <Cloud
              size={20}
              className="text-blue-600"
            />

            <span className="text-gray-700 font-medium">
              Cloud-Based Platform
            </span>

          </div>

          <div className="flex items-center justify-center gap-3">

            <Headphones
              size={20}
              className="text-purple-600"
            />

            <span className="text-gray-700 font-medium">
              Priority Support
            </span>

          </div>

        </div>

      </div>
</Reveal>
    </section>
  );
}