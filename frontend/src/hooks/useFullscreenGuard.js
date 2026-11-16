
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useExamStore } from "../store/examStore";

export function useFullscreenGuard(reportViolation) {
  const showStartOverlay = useExamStore(
    (state) => state.showStartOverlay
  );

  const setFullscreenRequired = useExamStore(
    (state) => state.setFullscreenRequired
  );

  // Native Android does not require browser fullscreen.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setFullscreenRequired(false);
      return;
    }

    if (showStartOverlay) return;

    if (!document.fullscreenElement) {
      setFullscreenRequired(true);
    }
  }, [showStartOverlay, setFullscreenRequired]);

  // Listen for browser fullscreen changes only.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const handleFullscreenChange = async () => {
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
