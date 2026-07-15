export default function ExamSelector({
  exams,
  selectedExam,
  setSelectedExam,
}) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">

      <label className="block mb-2 font-medium">
        Select Exam
      </label>

      <select
        className="w-full border rounded-lg p-2"
        value={selectedExam}
        onChange={(e) =>
          setSelectedExam(e.target.value)
        }
      >
        <option value="">
          -- Select Exam --
        </option>

        {exams.map((exam) => (
          <option
            key={exam.exam_uid}
            value={exam.exam_uid}
          >
            {exam.title}
          </option>
        ))}
      </select>

    </div>
  );
}