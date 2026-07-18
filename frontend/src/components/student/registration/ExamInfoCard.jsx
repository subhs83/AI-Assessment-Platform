import {
  Clock3,
  HelpCircle,
  FileText,
 Target,
  MinusCircle,
} from "lucide-react";

export default function ExamInfoCard({ exam }) {
  if (!exam) return null;

  const items = [
    {
      icon: FileText,
      label: "Title",
      value: exam.title,
    },
    
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
          : "No Negative Marking",
    },
    
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">

      <h2 className="text-2xl font-bold text-slate-900">
        Exam Information
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Please review the exam details before starting.
      </p>

      <div className="mt-6 space-y-4">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-100 p-2">
                  <Icon
                    size={20}
                    className="text-indigo-600"
                  />
                </div>

                <span className="font-medium text-slate-700">
                  {item.label}
                </span>

              </div>

              <span className="font-semibold text-slate-900">
                {item.value}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}