import { Link } from "react-router-dom";
import {
Sparkles,
FileText,
Image,
BookOpen,
CheckCircle
} from "lucide-react";

import PreviewCarousel from "./demopreview/PreviewCarousel";
import Reveal from "../common/Reveal";
import FloatingBlobs from "../common/FloatingBlobs";

export default function HeroSection() {
return ( 

<section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
  <Reveal>

  {/* Background Glow */}
 <FloatingBlobs
  color1="bg-blue-300/20"
  color2="bg-purple-300/20"
/>

  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-200/30 blur-3xl rounded-full" />
  
  <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">

    <div className="grid lg:grid-cols-2 gap-16">

      {/* LEFT */}

      <div className="pt-8">

        {/* Badge */}

        <div
          className="
            inline-flex
            items-center
            gap-2
            px-4 py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-8
          "
        >
          <Sparkles size={18} />

          AI-Powered Assessment Platform

        </div>

        {/* Heading */}

        <h1
          className="
            text-5xl
            lg:text-6xl
            font-bold
            text-gray-900
            leading-tight
          "
        >
          AI-Powered

          <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">

            Assessment Platform

          </span>

          for Schools and Educators

        </h1>

        {/* Description */}

        <p
          className="
            mt-7
            text-lg
            text-gray-600
            leading-relaxed
            max-w-xl
          "
        >
          Generate questions, conduct exams, and analyze student performance
          with one intelligent platform built for modern educators.
        </p>

        {/* CTA */}

        <div className="flex flex-wrap gap-4 mt-10">

          <Link
            to="/demo"
            className="
              px-8 py-4
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              shadow-lg
            "
          >
            Book Free Demo
          </Link>

          <Link
            to="/features"
            className="
              px-8 py-4
              rounded-2xl
              border
              bg-white
              hover:bg-gray-50
              font-semibold
            "
          >
            See AI in Action
          </Link>

        </div>

        {/* Trust */}

        <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-600">

          <div className="flex items-center gap-2">

            <CheckCircle
              size={16}
              className="text-green-600"
            />

            AI-Assisted

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle
              size={16}
              className="text-green-600"
            />

            Multi-School Ready

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle
              size={16}
              className="text-green-600"
            />

            Secure Platform

          </div>

        </div>

        {/* Feature Pills */}

        <div className="flex flex-wrap gap-3 mt-10">

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">

            <FileText
              size={16}
              className="text-blue-600"
            />

            PDF → Questions

          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">

            <Image
              size={16}
              className="text-blue-600"
            />

            Image → Questions

          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border">

            <BookOpen
              size={16}
              className="text-blue-600"
            />

            Topic → Questions

          </div>

        </div>

      </div>

      {/* RIGHT */}

      <div className="relative">

        <div
          className="
            absolute
            inset-0
            bg-yellow-100/30
            blur-3xl
            rounded-full
            scale-110
          "
        />

        <div className="relative lg:mt-8">
          <div className="absolute inset-0 bg-transparent blur-3xl rounded-full" />


          <PreviewCarousel />

        </div>

      </div>

    </div>

  </div>
  </Reveal>
</section>

);
}
