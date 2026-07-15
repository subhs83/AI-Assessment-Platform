import EmptyState from "../../ui/EmptyState";

import RecentExamItem from "./RecentExamItem";

export default function RecentExamsCard({
  recentExams,
  routes,
  handleShareQuiz,
}) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">

      {/* Header */}
      <div className="border-b px-5 py-4">

        <h2 className="font-semibold">
          Latest Published Exams
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Showing latest {Math.min(recentExams.length, 5)} exams
        </p>

      </div>

      <div className="p-5">

        {recentExams.length === 0 ? (

          <EmptyState
            title="No exams yet"
            description="Create your first exam to get started."
          />

        ) : (

          <div className="grid gap-4">

            {recentExams.map((exam) => (

              <RecentExamItem
                key={exam.id}
                exam={exam}
                routes={routes}
                handleShareQuiz={handleShareQuiz}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  );
}