import { useEffect } from "react";
import { useExamStore } from "../store/examStore";
import API from "../api/client";

export function useRefreshGuard(schoolSlug, attemptId) {

  const isSubmittingExam = useExamStore(
    (s) => s.isSubmittingExam
  );

  useEffect(() => {

    const handleBeforeUnload = () => {

      // 🔥 IMPORTANT: BLOCK DURING SUBMIT
      if (isSubmittingExam) return;

      const payload = JSON.stringify({
        reason: "page_refresh",
      });

      navigator.sendBeacon(
        `${API.defaults.baseURL}/api/student/${schoolSlug}/attempt/${attemptId}/violation`,
        payload
      );
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [schoolSlug, attemptId, isSubmittingExam]);
}