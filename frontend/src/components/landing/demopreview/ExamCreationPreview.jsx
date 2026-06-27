import {
Calendar,
Clock,
FileText,
GraduationCap,
Save,
CheckCircle
} from "lucide-react";

export default function ExamCreationPreview() {
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
          Create Exam
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Configure and publish assessments
        </p>

      </div>

      <CheckCircle className="text-green-600" />

    </div>

  </div>

  <div className="p-6 space-y-5">

    {/* Title */}

    <div className="border rounded-2xl p-4">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <FileText className="text-blue-600" size={20} />
        </div>

        <div>

          <div className="font-semibold">
            Exam Title
          </div>

          <div className="text-sm text-gray-500">
            Science Mid Term Test
          </div>

        </div>

      </div>

    </div>

    {/* Class */}

    <div className="border rounded-2xl p-4">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <GraduationCap className="text-purple-600" size={20} />
        </div>

        <div>

          <div className="font-semibold">
            Class
          </div>

          <div className="text-sm text-gray-500">
            Grade 10 - A
          </div>

        </div>

      </div>

    </div>

    {/* Settings */}

    <div className="grid grid-cols-2 gap-4">

      <div className="bg-gray-50 rounded-2xl p-4">

        <div className="flex items-center gap-2 text-gray-500 text-sm">

          <Clock size={16} />

          Duration

        </div>

        <div className="font-bold mt-2">
          60 Minutes
        </div>

      </div>

      <div className="bg-gray-50 rounded-2xl p-4">

        <div className="text-gray-500 text-sm">
          Marks / Question
        </div>

        <div className="font-bold mt-2">
          1 Mark
        </div>

      </div>

    </div>

    {/* Dates */}

    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">

      <div className="flex items-center gap-3">

        <Calendar
          size={20}
          className="text-green-600"
        />

        <div>

          <div className="font-semibold text-green-700">
            Scheduled Successfully
          </div>

          <div className="text-sm text-green-600">
            15 Jul 2026 • 10:00 AM
          </div>

        </div>

      </div>

    </div>

    {/* Publish */}

    <button
      className="
        w-full
        bg-blue-600
        text-white
        py-4
        rounded-2xl
        font-semibold
        flex
        items-center
        justify-center
        gap-2
      "
    >
      <Save size={18} />

      Publish Exam

    </button>

  </div>

</div>
);
}
