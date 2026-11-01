import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/client";
import { useExamStore } from "../../store/examStore";
import BrandLoading from "../../components/loading/BrandLoading";

export default function QuizInitPage() {
  const { schoolSlug, quizCode } = useParams();
  const navigate = useNavigate();

  const initSession = useExamStore((s) => s.initSession);

  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const registerUrl =
      `/school/${schoolSlug}/quiz/${quizCode}/register`;

    const fetchState = async () => {
      setError(null);

      try {
        const res = await API.get(
          `/api/student/${schoolSlug}/quiz/${quizCode}/state`
        );

        if (cancelled) return;

        const data = res.data?.data;

        if (!data) {
          throw new Error("Invalid quiz session response.");
        }

        // Registration required
        if (data.state === "register") {
          navigate(registerUrl, { replace: true });
          return;
        }

        // Resume existing attempt
        if (data.state === "quiz") {
          if (!data.attempt_id || !data.total_questions) {
            throw new Error(
              "Incomplete quiz session information."
            );
          }

          useExamStore.getState().reset();

          initSession({
            attempt_id: data.attempt_id,
            exam_id: data.exam_id,
            schoolSlug,
            total_questions: data.total_questions,
          });

          navigate(
            `/school/${schoolSlug}/attempt/${data.attempt_id}/0`,
            { replace: true }
          );

          return;
        }

        // Show completed result
        if (data.state === "result") {
          if (!data.attempt_id) {
            throw new Error("Result attempt ID is missing.");
          }

          navigate(
            `/school/${schoolSlug}/result/${data.attempt_id}`,
            { replace: true }
          );

          return;
        }

        throw new Error("Unknown quiz session state.");

      } catch (err) {
        if (cancelled) return;

        console.error("STATE ERROR:", err);

        setError(
          "Unable to restore your quiz session. Please check your connection and try again."
        );
      }
    };

    fetchState();

    return () => {
      cancelled = true;
    };
  }, [schoolSlug, quizCode, navigate, initSession, retryKey]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Unable to Load Quiz
          </h2>

          <p className="mt-3 text-sm text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <BrandLoading />;
}