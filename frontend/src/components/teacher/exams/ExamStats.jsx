export default function ExamStats({ exam }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

      <div>
        <p className="text-sm text-gray-500">Questions</p>
        <p className="font-semibold">
          {exam.total_questions}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Attempts</p>
        <p className="font-semibold">
          {exam.total_attempts}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Duration</p>
        <p className="font-semibold">
          {exam.duration_minutes} min
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Max Attempts</p>
        <p className="font-semibold">
          {exam.max_attempts_per_student}
        </p>
      </div>

    </div>
  );
}