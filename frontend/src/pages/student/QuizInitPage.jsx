import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/client";
import { useExamStore } from "../../store/examStore";

export default function QuizInitPage() {
  const { schoolSlug, quizCode } = useParams();
  const navigate = useNavigate();

  const initSession = useExamStore((s) => s.initSession);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await API.get(
          `/api/student/${schoolSlug}/quiz/${quizCode}/state`
        );

        const data = res.data?.data;

        if (!data) {
          navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);
          return;
        }

        // --------------------------------------------------
        // Registration Required
        // --------------------------------------------------
        if (data.state === "register") {
          navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);
          return;
        }

        // --------------------------------------------------
        // Continue Existing Attempt
        // --------------------------------------------------
        if (data.state === "quiz") {
          // Safety check
          if (!data.attempt_id) {
            console.warn(
              "Quiz state received without attempt_id. Redirecting to registration."
            );

            navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);
            return;
          }

          useExamStore.getState().reset();

          initSession({
            attempt_id: data.attempt_id,
            exam_id: data.exam_id,
            schoolSlug,
            total_questions: data.total_questions,
          });

          navigate(
            `/school/${schoolSlug}/attempt/${data.attempt_id}/0`
          );

          return;
        }

        // --------------------------------------------------
        // Show Result
        // --------------------------------------------------
        if (data.state === "result") {
          navigate(
            `/school/${schoolSlug}/result/${data.attempt_id}`
          );

          return;
        }

        // Unknown state
        navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);

      } catch (err) {
        console.error("STATE ERROR:", err);

        navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);
      }
    };

    fetchState();
  }, [schoolSlug, quizCode, navigate, initSession]);

  return <h3>Loading Quiz...</h3>;
}