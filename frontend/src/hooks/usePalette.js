import { useEffect } from "react";
import API from "../api/client";
import { useExamStore } from "../store/examStore";

export function usePalette(
  schoolSlug,
  attemptId
) {
  const palette = useExamStore(
    (state) => state.palette
  );

  const setPalette = useExamStore(
    (state) => state.setPalette
  );

  useEffect(() => {
    if (!attemptId) return;

    const loadPalette = async () => {
      try {
        const res = await API.get(
          `/api/student/${schoolSlug}/attempt/${attemptId}/palette`
        );

        setPalette(
          res.data.data.palette || []
        );
      } catch (err) {
        console.log(
          "PALETTE ERROR:",
          err.response?.data ||
            err.message
        );
      }
    };

    loadPalette();
  }, [
    schoolSlug,
    attemptId,
    setPalette,
  ]);

  return {
    palette,
  };
}