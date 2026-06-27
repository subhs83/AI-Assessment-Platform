import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { examApi } from "../api/examApi";
import { useExamStore } from "../store/examStore";


export function useExamQuestion({schoolSlug,attemptId, index}) {
  
  const navigate = useNavigate();

  const setQuestion =
    useExamStore(
      (state) => state.setQuestion
    );

  useEffect(() => {
    if (!schoolSlug || !attemptId || index == null || Number.isNaN(index)) return;
    
    const fetchQuestion = async () => {
      try {
        const res =
          await examApi.getQuestion(
            schoolSlug,
            attemptId,
            index
          );

        const data =
          res.data.data;

        setQuestion(index, data);

      } catch (err) {

        const apiError =
          err.response?.data?.error;

        if (
          apiError === "time_expired" ||
          apiError === "already_submitted"
        ) {
          navigate(
            `/school/${schoolSlug}/result/${attemptId}`
          );

          return;
        }

        console.log(
          "QUESTION ERROR:",
          err.response?.data ||
            err.message
        );
      }
    };

    fetchQuestion();
  }, [
    schoolSlug,
    attemptId,
    index,
    navigate,
    setQuestion,
  ]);
}