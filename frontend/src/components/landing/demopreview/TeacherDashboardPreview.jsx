export default function TeacherDashboardPreview() {
  return (
    <>
      {/* preview code here */}
      {/* RIGHT SIDE */}

<div className="relative lg:pt-4">

{/* Glow */}

  <div
    className="
      absolute
      inset-0
      bg-blue-200/30
      blur-3xl
      rounded-full
      scale-110
    "
  />

  <div
    className="
      relative
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
        Teacher Dashboard
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        AI-Powered Assessment Platform
      </p>

    </div>

    <div className="w-3 h-3 rounded-full bg-green-500" />

  </div>

</div>

{/* Stats */}

<div className="grid grid-cols-3 gap-4 p-6">

  <div className="bg-blue-50 rounded-2xl p-4">

    <p className="text-sm text-gray-500">
      Total Exams
    </p>

    <div className="text-3xl font-bold text-blue-700 mt-2">
      124
    </div>

  </div>

  <div className="bg-green-50 rounded-2xl p-4">

    <p className="text-sm text-gray-500">
      Attempts
    </p>

    <div className="text-3xl font-bold text-green-700 mt-2">
      4.2K
    </div>

  </div>

  <div className="bg-purple-50 rounded-2xl p-4">

    <p className="text-sm text-gray-500">
      Questions
    </p>

    <div className="text-3xl font-bold text-purple-700 mt-2">
      18K
    </div>

  </div>

</div>

{/* Recent Exams */}

<div className="px-6 pb-6">

  <div className="border rounded-2xl p-5">

    <div className="flex items-center justify-between mb-5">

      <div>

        <h4 className="font-semibold text-gray-900">
          Recent Exams
        </h4>

        <p className="text-sm text-gray-500">
          Latest assessments
        </p>

      </div>

    </div>

    <div className="space-y-4">

      <div className="border rounded-xl p-4">

        <div className="flex items-center justify-between">

          <div>

            <h5 className="font-semibold">
              Science Mid Term Test
            </h5>

            <div className="mt-2 inline-flex px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Published
            </div>

          </div>

          <div className="text-sm text-gray-500">
            Quiz Code: SCI123
          </div>

        </div>

      </div>

      <div className="border rounded-xl p-4">

        <div className="flex items-center justify-between">

          <div>

            <h5 className="font-semibold">
              Mathematics Quiz
            </h5>

            <div className="mt-2 inline-flex px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Published
            </div>

          </div>

          <div className="text-sm text-gray-500">
            Quiz Code: MAT456
          </div>

        </div>

      </div>


    </div>

  </div>

</div>
  </div>

</div>

    </>
  );
}