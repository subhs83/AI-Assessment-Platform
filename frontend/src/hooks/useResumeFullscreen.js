
import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useExamStore } from "../store/examStore";

export function useResumeFullscreen() {
  const setFullscreenRequired = useExamStore(
    (state) => state.setFullscreenRequired
  );

  const setShowViolationOverlay = useExamStore(
    (state) => state.setShowViolationOverlay
  );

  const resumeFullscreen = useCallback(async () => {
    // Native Android app does not use browser fullscreen.
    if (Capacitor.isNativePlatform()) {
      setFullscreenRequired(false);
      setShowViolationOverlay(false);
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      setFullscreenRequired(false);
      setShowViolationOverlay(false);
    } catch (err) {
      console.log("FULLSCREEN ERROR:", err);
    }
  }, [setFullscreenRequired, setShowViolationOverlay]);

  return { resumeFullscreen };
}
