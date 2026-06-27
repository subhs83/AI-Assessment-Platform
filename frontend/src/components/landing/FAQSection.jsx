import { useState } from "react";
import {
  ChevronDown,
  ChevronUp
} from "lucide-react";
import SEO from "../common/SEO"
import Reveal from "../common/Reveal";
import StaggerContainer from "../common/StaggerContainer";
import StaggerItem from "../common/StaggerItem";

export default function FAQSection() {

 const getFaqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",

  mainEntity: faqs.map((faq) => ({

    "@type": "Question",

    name: faq.question,

    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }

  }))
});

  const faqs = [
    {
      question: "How does IndiaEduCore help teachers?",
      answer:
        "IndiaEduCore helps teachers save time by generating questions with AI, conducting exams, and analyzing student performance from one platform."
    },

    {
      question: "Can AI generate questions from PDFs and images?",
      answer:
        "Yes. Upload PDFs, handwritten notes, screenshots, or images and AI will generate balanced question sets automatically."
    },

    {
      question: "Can teachers edit AI-generated questions?",
      answer:
        "Absolutely. Teachers can review, modify, delete, or add questions before publishing an exam."
    },

    {
      question: "Can I create questions from topics or text?",
      answer:
        "Yes. Simply enter a topic or paste text and AI can generate questions within seconds."
    },

    {
      question: "Does IndiaEduCore provide analytics and reports?",
      answer:
        "Yes. Performance analytics, leaderboards, and reports help educators identify learning gaps and monitor outcomes."
    },

    {
      question: "Can multiple teachers use the platform?",
      answer:
        "Yes. Schools and institutions can have multiple teachers working collaboratively on assessments and academic activities."
    },

    {
      question: "Is IndiaEduCore cloud-based and secure?",
      answer:
        "Yes. IndiaEduCore is a secure cloud platform that can be accessed from anywhere without additional installation."
    },

    {
      question: "Who is IndiaEduCore designed for?",
      answer:
        "IndiaEduCore is built for schools, educators, coaching centers, and institutions looking to modernize assessments with AI."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
    <SEO
        structuredData={
            getFaqSchema([
              {
                question: "Can AI generate questions from PDFs?",
                answer:
                  "Yes. Upload chapters, notes, or study material and AI generates balanced questions automatically."
              },

              {
                question: "Can AI generate questions from images?",
                answer:
                  "Yes. Images and handwritten notes can be converted into assessments."
              }
            ])
          }
        />
    <section className="py-10 bg-gray-50">
      <Reveal>

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}

        <div className="text-center">

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
            Frequently Asked Questions
          </div>

          <h2
            className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900"
          >
            Everything You Need to Know
          </h2>

          <p
            className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed"
          >
            Answers to common questions about AI-powered assessments and academic workflows.
          </p>

        </div>


        {/* FAQ */}
        <StaggerContainer>
        <div className="mt-8 space-y-5">

          {faqs.map((faq, index) => {

            const isOpen = openIndex === index;

            return (
              <StaggerItem key={index}>
              <div
                
                className="
                bg-white
                border
                rounded-3xl
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
                overflow-hidden"
              >

                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="
                  w-full
                  flex
                  justify-between
                  items-center
                  text-left
                  p-7"
                >

                  <span
                    className="
                    text-lg
                    font-semibold
                    text-gray-900
                    pr-4"
                  >
                    {faq.question}
                  </span>

                  <div className="text-blue-600 shrink-0">

                    {
                      isOpen
                        ? <ChevronUp size={20} />
                        : <ChevronDown size={20} />
                    }

                  </div>

                </button>

                <div
                  className={`
                    transition-all
                    duration-300
                    overflow-hidden
                    ${isOpen ? "max-h-40" : "max-h-0"}
                  `}
                >

                  <div
                    className="
                    px-7
                    pb-7
                    text-gray-600
                    leading-relaxed"
                  >

                    {faq.answer}

                  </div>

                </div>

              </div>
              </StaggerItem>

            );

          })}

        </div>
        </StaggerContainer>

      </div>
</Reveal>

    </section>

    </>
  );

}