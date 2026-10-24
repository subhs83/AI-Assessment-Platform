import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { examApi } from "../api/examApi";
import { useExamStore } from "../store/examStore";

export function useExamQuestion({
  schoolSlug,
  attemptId,
  index,
}) {
  const navigate = useNavigate();
  const setQuestion = useExamStore((state) => state.setQuestion);

  const requestKey = JSON.stringify([
    schoolSlug,
    attemptId,
    index,
  ]);

  const [result, setResult] = useState({
    key: null,
    status: "loading",
    error: "",
  });

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (
      !schoolSlug ||
      !attemptId ||
      !Number.isInteger(index) ||
      index < 0
    ) {
      setResult({
        key: requestKey,
        status: "error",
        error: "Invalid question address.",
      });
      return;
    }

    // Ignore responses after navigation or unmount.
    let active = true;

    const cacheShown = useExamStore
      .getState()
      .showCachedQuestion(schoolSlug, attemptId, index);

    setResult({
      key: requestKey,
      status: cacheShown ? "ready" : "loading",
      error: "",
    });

    const fetchQuestion = async () => {
      try {
        const res = await examApi.getQuestion(
          schoolSlug,
          attemptId,
          index
        );

        if (!active) return;

        const data = res.data?.data;

        if (!data || data.question_id == null) {
          throw new Error("Invalid question response.");
        }

        setQuestion(index, data);

        setResult({
          key: requestKey,
          status: "ready",
          error: "",
        });
      } catch (err) {
        if (!active) return;

        const apiError = err.response?.data?.error;

        if (
          apiError === "time_expired" ||
          apiError === "already_submitted"
        ) {
          navigate(
            `/school/${schoolSlug}/result/${attemptId}`,
            { replace: true }
          );
          return;
        }

        console.error(
          "QUESTION ERROR:",
          err.response?.data || err.message
        );

        setResult({
          key: requestKey,
          status: "error",
          error: "Unable to load this question. Please try again.",
        });
      }
    };

    fetchQuestion();

    return () => {
      active = false;
    };
  }, [
    schoolSlug,
    attemptId,
    index,
    requestKey,
    retryCount,
    navigate,
    setQuestion,
  ]);

  return {
    questionReady:
      result.key === requestKey &&
      result.status === "ready",

    questionError:
      result.key === requestKey &&
      result.status === "error"
        ? result.error
        : "",

    retryQuestion: () => {
      setResult({
        key: requestKey,
        status: "loading",
        error: "",
      });
      setRetryCount((count) => count + 1);
    },
  };
}