import { useEffect } from "react";
import { useExamStore } from "../store/examStore";

export function useExamTimer() {
  const tick = useExamStore(
    (state) => state.tick
  );

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);
}