import { useExamStore } from "../store/examStore";

export function useResumeFullscreen() {
  const setFullscreenRequired =
    useExamStore(
      (state) =>
        state.setFullscreenRequired
    );

  const resumeFullscreen =
    async () => {
      try {
        await document.documentElement.requestFullscreen();

        setFullscreenRequired(
          false
        );
      } catch (err) {
        console.log(
          "FULLSCREEN ERROR:",
          err
        );
      }
    };

  return {
    resumeFullscreen,
  };
}