import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { examApi } from "../api/examApi";
import { useExamStore } from "../store/examStore";

// Share an ongoing request if navigation reaches a question
// while its prefetch is still running.
const pendingRequests = new Map();

function requestQuestion(schoolSlug, attemptId, index) {
  const key = JSON.stringify([schoolSlug, attemptId, index]);

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = examApi
    .getQuestion(schoolSlug, attemptId, index)
    .then((res) => {
      const data = res.data?.data;

      if (
        !data ||
        data.question_id == null ||
        String(data.attempt_id) !== String(attemptId) ||
        Number(data.q_index) !== index
      ) {
        throw new Error("Invalid question response.");
      }

      return data;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}

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

    let active = true;

    const cacheShown = useExamStore
      .getState()
      .showCachedQuestion(schoolSlug, attemptId, index);

    setResult({
      key: requestKey,
      status: cacheShown ? "ready" : "loading",
      error: "",
    });

    const redirectIfFinished = (err) => {
      const apiError = err.response?.data?.error;

      if (
        apiError === "time_expired" ||
        apiError === "already_submitted"
      ) {
        navigate(
          `/school/${schoolSlug}/result/${attemptId}`,
          { replace: true }
        );
        return true;
      }

      return false;
    };

    const prefetchNext = async (totalQuestions) => {
      const nextIndex = index + 1;
      const state = useExamStore.getState();

      if (
        !active ||
        nextIndex >= totalQuestions ||
        state.isOffline ||
        state.isSubmittingExam
      ) {
        return;
      }

      const cached = state.questionCache[nextIndex];

      if (
        state.schoolSlug === schoolSlug &&
        String(state.attemptId) === String(attemptId) &&
        String(cached?.attempt_id) === String(attemptId) &&
        Number(cached?.q_index) === nextIndex
      ) {
        return;
      }

      try {
        const data = await requestQuestion(
          schoolSlug,
          attemptId,
          nextIndex
        );

        if (!active) return;

        useExamStore.getState().cacheQuestion(
          schoolSlug,
          attemptId,
          nextIndex,
          data
        );
      } catch (err) {
        if (!active) return;

        // Expiry still matters during a background fetch.
        // Other prefetch failures leave the current question usable.
        redirectIfFinished(err);
      }
    };

    const fetchQuestion = async () => {
      try {
        const data = await requestQuestion(
          schoolSlug,
          attemptId,
          index
        );

        if (!active) return;

        setQuestion(index, data);

        setResult({
          key: requestKey,
          status: "ready",
          error: "",
        });

        // Fetch only one question ahead.
        void prefetchNext(data.total_questions);
      } catch (err) {
        if (!active) return;
        if (redirectIfFinished(err)) return;

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

    void fetchQuestion();

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