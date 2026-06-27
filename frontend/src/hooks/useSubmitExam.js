import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "../store/examStore";
import { examApi } from "../api/examApi";

export function useSubmitExam(schoolSlug, attemptId) {
  const navigate = useNavigate();

  const setSubmittingExam =
    useExamStore((s) => s.setSubmittingExam);

  const submitExam = useCallback(
    async (isAuto = false) => {
      try {
        setSubmittingExam(true);

        await examApi.submitExam(schoolSlug, attemptId);

        navigate(`/school/${schoolSlug}/result/${attemptId}`, {
          state: isAuto
            ? {
                autoSubmitted: true,
                reason: "time_expired",
              }
            : {},
        });

      } catch (err) {
        const apiError = err.response?.data?.error;

        if (
          apiError === "time_expired" ||
          apiError === "already_submitted"
        ) {
          navigate(`/school/${schoolSlug}/result/${attemptId}`, {
            state: {
              autoSubmitted: true,
              reason: "time_expired",
            },
          });
        }
      } finally {
        setSubmittingExam(false);
      }
    },
    [schoolSlug, attemptId, navigate, setSubmittingExam]
  );

  return { submitExam };
}
 