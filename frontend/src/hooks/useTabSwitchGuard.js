import { useEffect } from "react";

export function useTabSwitchGuard(
  reportViolation
) {
  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.hidden
        ) {
          reportViolation(
            "tab_switch"
          );
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
  }, [reportViolation]);
}