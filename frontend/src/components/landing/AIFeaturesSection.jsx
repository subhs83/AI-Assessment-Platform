import {
FileText,
ImageIcon,
BookOpen,
ClipboardPaste,
Sparkles,
} from "lucide-react";

import Reveal from "../common/Reveal"
import AIQuestionPreview from "./demopreview/AIQuestionPreview";
import StaggerContainer from "../common/StaggerContainer";
import StaggerItem from "../common/StaggerItem";

export default function AIFeaturesSection() {
const features = [
{
icon: FileText,
title: "PDF Upload",
description:
"Generate assessment questions directly from chapters, notes, and study materials.",
bg: "bg-blue-50",
color: "text-blue-600",
},


{
  icon: ImageIcon,
  title: "Image Upload",
  description:
    "Convert handwritten notes, screenshots, and images into assessments.",
  bg: "bg-green-50",
  color: "text-green-600",
},

{
  icon: BookOpen,
  title: "Topic Based",
  description:
    "Generate balanced question sets from any topic instantly.",
  bg: "bg-purple-50",
  color: "text-purple-600",
},

{
  icon: ClipboardPaste,
  title: "Text Input",
  description:
    "Paste content directly and transform it into assessment questions.",
  bg: "bg-orange-50",
  color: "text-orange-600",
},


];

return ( 

<section className="py-10 bg-gradient-to-b from-blue-50 to-white">
  <Reveal>

  <div className="max-w-7xl mx-auto px-6">

    {/* Header */}

    <div className="text-center max-w-3xl mx-auto">

      <div
        className="
          inline-flex
          items-center
          gap-2
          px-4
          py-1
          rounded-full
          bg-blue-100
          text-blue-700
          font-medium
          mb-6
        "
      >
        <Sparkles size={18} />
        AI Question Generation
      </div>

      <h2
        className="
          text-4xl
          lg:text-5xl
          font-bold
          text-gray-900
        "
      >
        Generate Assessment Questions with AI
      </h2>

      <p
        className="
          mt-6
          text-lg
          text-gray-600
          leading-relaxed
        "
      >
        Create high-quality assessments from PDFs, images,
        topics, and text in minutes instead of hours.
      </p>

    </div>

    {/* Content */}

    <div className="grid lg:grid-cols-5 gap-8 mt-10">

      {/* Featured Card */}

      <div className="lg:col-span-3">

          <div className="px-6">
    
            <AIQuestionPreview/>
      
          </div>


      </div>

      {/* Supporting Features */}

      <div className="lg:col-span-2">
        <StaggerContainer>

        <div className="grid gap-5">

          {features.map((item) => {
            const Icon = item.icon;

            return (
              <StaggerItem key={item.title}>
              <div
                className="
                  bg-white
                  border
                  rounded-2xl
                  p-5
                  hover:shadow-lg
                  transition-all
                  duration-300
                "
              >

                <div className="flex gap-4 group">

                  <div
                    className={`
                      h-12
                      w-12
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      hover:shadow-xl
                      transition-all
                    duration-300
                      ${item.bg}
                    `}
                  >
                    <Icon
                      size={22}
                      className={item.color}
                    />
                  </div>

                  <div>

                    <h4
                      className="
                        font-semibold
                        text-gray-900
                      "
                    >
                      {item.title}
                    </h4>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-gray-600
                        leading-relaxed
                      "
                    >
                      {item.description}
                    </p>

                  </div>

                </div>

              </div>
              </StaggerItem>
            );
          })}

        </div>
        </StaggerContainer>

      </div>

    </div>

  </div>

</Reveal>
</section>
);
}
