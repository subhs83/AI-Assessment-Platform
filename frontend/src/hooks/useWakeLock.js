import { useEffect } from "react";

export function useWakeLock() {
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock =
      async () => {
        try {
          if (
            "wakeLock" in
            navigator
          ) {
            wakeLock =
              await navigator.wakeLock.request(
                "screen"
              );
          }
        } catch (err) {
          console.log(
            "WAKE LOCK ERROR:",
            err
          );
        }
      };

    requestWakeLock();

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          requestWakeLock();
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

      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);
}