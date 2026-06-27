import {
BookOpen,
FileText,
CheckCircle,
Sparkles
} from "lucide-react";

export default function AIQuestionPreview() {
return ( <div
   className="
     bg-white
     rounded-3xl
     border
     shadow-lg
     overflow-hidden
     hover:shadow-2xl
    transition-all
    duration-300
   "
   
 >

  {/* Header */}

  <div className="border-b px-6 py-5">

    <div className="flex items-center justify-between">

      <div>

        <h3 className="font-bold text-xl text-gray-900">
          AI Question Generator
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Generate assessments in seconds
        </p>

      </div>

      <Sparkles className="text-blue-600" />

    </div>

  </div>

  <div className="p-6 space-y-5">

    {/* Topic */}

    <div className="border rounded-2xl p-4">

      <div className="flex items-center gap-3">

        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <BookOpen className="text-purple-600" size={20} />
        </div>

        <div>

          <div className="font-semibold">
            Topic Input
          </div>

          <div className="text-sm text-gray-500">
            Photosynthesis
          </div>

        </div>

      </div>

    </div>

    {/* File */}

    <div className="border rounded-2xl p-4">

      <div className="flex items-center gap-3">

        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <FileText className="text-blue-600" size={20} />
        </div>

        <div>

          <div className="font-semibold">
            PDF Upload
          </div>

          <div className="text-sm text-gray-500">
            Biology_Chapter_3.pdf
          </div>

        </div>

      </div>

    </div>

    {/* Extraction */}

    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">

      <div className="flex items-center gap-3">

        <CheckCircle
          className="text-green-600"
          size={22}
        />

        <div>

          <div className="font-semibold text-green-700">
            Content Extracted Successfully
          </div>

          <div className="text-sm text-green-600">
            2,400 words • Ready for AI generation
          </div>

        </div>

      </div>

    </div>

    {/* Settings */}

    <div className="grid grid-cols-2 gap-4">

      <div className="bg-gray-50 rounded-2xl p-4">

        <div className="text-sm text-gray-500">
          Difficulty
        </div>

        <div className="font-bold mt-2">
          Medium
        </div>

      </div>

      <div className="bg-gray-50 rounded-2xl p-4">

        <div className="text-sm text-gray-500">
          Questions
        </div>

        <div className="font-bold mt-2">
          20 MCQs
        </div>

      </div>

    </div>

    {/* Generate */}

    <button
      className="
        w-full
        bg-blue-600
        text-white
        rounded-2xl
        py-4
        font-semibold
      "
    >
      Generate Questions
    </button>

  </div>

</div>
);
}
