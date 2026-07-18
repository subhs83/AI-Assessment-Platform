import { useEffect } from "react";
import { useExamStore } from "../store/examStore";

export function useFullscreenGuard(reportViolation) {

  const showStartOverlay = useExamStore(
    (state) => state.showStartOverlay
  );

  const setFullscreenRequired = useExamStore(
    (state) => state.setFullscreenRequired
  );

  // Initial check
  useEffect(() => {

    // Ignore until the student starts the exam
    if (showStartOverlay) return;

    if (!document.fullscreenElement) {
      setFullscreenRequired(true);
    }

  }, [showStartOverlay, setFullscreenRequired]);

  // Listen for fullscreen changes
  useEffect(() => {

    const handleFullscreenChange = async () => {

      // Ignore startup
      if (showStartOverlay) return;

      if (!document.fullscreenElement) {

        setFullscreenRequired(true);

        await reportViolation("fullscreen_exit");

      } else {

        setFullscreenRequired(false);

      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };

  }, [
    showStartOverlay,
    reportViolation,
    setFullscreenRequired,
  ]);
}