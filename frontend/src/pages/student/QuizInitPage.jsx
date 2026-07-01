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
        console.log("STATE RESPONSE:", res.data);
        console.log("STATE DATA:", data);

        if (!data) return;

        if (data.state === "register") {
          console.log("Navigate -> Register");
          navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);
          return;
        }

        if (data.state === "quiz") {
         
          useExamStore.getState().reset();
          initSession({
            attempt_id: data.attempt_id,
            exam_id: data.exam_id,
            schoolSlug,
            total_questions: data.total_questions,
          });
          console.log("Navigate -> Quiz", data.attempt_id);
          navigate("/exam");
          return;
        }

        if (data.state === "result") {
          console.log("Navigate -> Result", data.attempt_id);
          navigate(`/school/${schoolSlug}/result/${data.attempt_id}`);
          return;
        }

        navigate(`/school/${schoolSlug}/quiz/${quizCode}/register`);
      } catch (err) {
        console.log("STATE ERROR:", err);
      }
    };

    fetchState();
  }, [schoolSlug, quizCode, navigate, initSession]);

  return <h3>Loading Quiz...</h3>;
}