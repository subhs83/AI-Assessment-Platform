import {
  Clock3,
  HelpCircle,
  Target,
  MinusCircle,
} from "lucide-react";

export default function ExamInfoCard({ exam }) {
  if (!exam) return null;

  const items = [
    {
      icon: Clock3,
      label: "Duration",
      value: `${exam.duration_minutes} Minutes`,
    },
    {
      icon: HelpCircle,
      label: "Questions",
      value: exam.total_questions,
    },
    {
      icon: Target,
      label: "Marks / Question",
      value: exam.marks_per_question,
    },
    {
      icon: MinusCircle,
      label: "Negative Marking",
      value:
        Number(exam.negative_marks) > 0
          ? `${exam.negative_marks} Mark`
          : "No",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6">

      {/* Header */}

      <div className="text-center">

        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Exam Information
        </p>

        <h2 className="mt-3 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
          {exam.title}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please review the exam details before starting.
        </p>

      </div>

      {/* Stats */}

      <div className="mt-6 space-y-3">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                  <Icon
                    size={20}
                    className="text-indigo-600"
                  />
                </div>

                <div>

                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>

                  <p className="font-semibold text-slate-900">
                    {item.value}
                  </p>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Footer */}

      <div className="mt-6 rounded-2xl bg-indigo-50 p-4">

        <p className="text-sm font-medium text-indigo-700">
          Be sure to verify all exam details before proceeding.
        </p>

      </div>

    </div>
  );
}