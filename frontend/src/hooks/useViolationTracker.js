import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { examApi } from "../api/examApi";
import { useExamStore } from "../store/examStore";

export function useViolationTracker(
  schoolSlug,
  attemptId
) {
  const navigate = useNavigate();

  const setViolationCount =
    useExamStore(
      (state) =>
        state.setViolationCount
    );

  const reportViolation =
    useCallback(
      async (reason) => {
        try {
          const res =
            await examApi.reportViolation(
              schoolSlug,
              attemptId,
              reason
            );

          const data =
            res.data.data;

          if (!data)
            return false;

          setViolationCount(
            data.violation_count || 0
          );

          if (
            data.auto_submitted
          ) {
            navigate(
              `/school/${schoolSlug}/result/${attemptId}`,
              {
                state: {
                  autoSubmitted: true,
                  reason:
                    "max_violations",
                },
              }
            );

            return true;
          }

          return false;
        } catch (err) {
          console.log(
            "VIOLATION ERROR:",
            err.response?.data ||
              err.message
          );

          return false;
        }
      },
      [
        schoolSlug,
        attemptId,
        navigate,
        setViolationCount,
      ]
    );

  return {
    reportViolation,
  };
}