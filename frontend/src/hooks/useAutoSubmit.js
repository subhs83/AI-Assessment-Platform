import { useEffect } from "react";
//import { useExamStore } from "../store/examStore";
export function useAutoSubmit({
  remainingSeconds,
  currentQuestion,
  attemptId,
  submitExam,
  
}) {
  useEffect(() => {

    if (remainingSeconds !== 0) return;
    if (!currentQuestion) return;
    // Prevent stale question from previous attempt
    if (String(currentQuestion.attempt_id) !== String(attemptId)) {
      return;
    }

    submitExam(true);
  }, [remainingSeconds,currentQuestion, attemptId,submitExam,]
);
}