import { useEffect } from "react";
import { useExamStore } from "../store/examStore";

export function useOfflineDetector() {
  const setOffline = useExamStore(
    (state) => state.setOffline
  );

  useEffect(() => {
    const handleOffline = () => {
      setOffline(true);
    };

    const handleOnline = () => {
      setOffline(false);
    };

    setOffline(!navigator.onLine);

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, [setOffline]);
}