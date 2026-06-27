import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/client";
import { teacherRoutes } from "../../routes/teacherRoutes";
import BackButton from "../../components/ui/BackButton";

export default function ReviewQuestionsPage() {
  const { schoolSlug, examId } = useParams();
   const routes = teacherRoutes(schoolSlug);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/api/teacher/${schoolSlug}/exams/${examId}/questions`
      );

      setQuestions(res.data.data?.questions || []);
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Review Questions
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Validate uploaded questions before publishing
          </p>
        </div>

        <BackButton to={routes.exams.list} label="Back to Exams " />
        
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-gray-500">
          Loading questions...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && questions.length === 0 && (
        <div className="p-6 bg-yellow-50 border rounded">
          No questions found. Upload questions first.
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">

        {questions.map((q, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg p-4"
          >

            <p className="font-medium">
              Q{index + 1}. {q.question_text}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">

              <p>A: {q.option_a}</p>
              <p>B: {q.option_b}</p>
              <p>C: {q.option_c}</p>
              <p>D: {q.option_d}</p>

            </div>

            <p className="mt-2 text-sm text-green-600">
              Correct: {q.correct_option}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}