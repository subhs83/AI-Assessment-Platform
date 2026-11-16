
import { useEffect } from "react";
import { useExamStore } from "../store/examStore";

export function useTabSwitchGuard(reportViolation) {
  const showStartOverlay = useExamStore(
    (state) => state.showStartOverlay
  );

  useEffect(() => {
    let violationReported = false;

    const handleVisibilityChange = () => {
      if (showStartOverlay) return;

      if (document.hidden) {
        if (violationReported) return;

        violationReported = true;
        reportViolation("tab_switch");
      } else {
        // Allow a new violation after the student returns.
        violationReported = false;
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [reportViolation, showStartOverlay]);
}
