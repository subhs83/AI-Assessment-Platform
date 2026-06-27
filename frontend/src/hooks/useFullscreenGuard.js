import { useEffect } from "react";
import { useExamStore } from "../store/examStore";

export function useFullscreenGuard(reportViolation) {

  const setFullscreenRequired =
    useExamStore((state) => state.setFullscreenRequired);


  // 🚨 FIX 1: initial check (block during submit)
  useEffect(() => {


    if (!document.fullscreenElement) {
      setFullscreenRequired(true);
    }
  }, [setFullscreenRequired]);

  // 🚨 FIX 2: fullscreen change listener
  useEffect(() => {

    const handleFullscreenChange = async () => {

      // 🔥 IMPORTANT: BLOCK DURING SUBMIT
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
  }, [reportViolation,setFullscreenRequired]
);
}