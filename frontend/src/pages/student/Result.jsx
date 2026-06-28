import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/client";
import { ArrowRightCircle, UserPlus, BookOpen,Target, EyeOff  } from "lucide-react";
import HeroSection from "../../components/student/result/HeroSection";
import QuestionReviewCard from "../../components/student/result/QuestionReviewCard";
import ResultHeader from "../../components/student/result/ResultHeader";
import ResultSkeleton from "../../components/student/result/ResultSkeleton";
import {  getPerformanceTheme,  getAchievementText,} from "../../utils/resultUtils";
import ResultConfetti from "../../components/common/ResultConfetti";

import PerformanceSummary from "../../components/student/result/PerformanceSummary";
import QuestionNavigator from "../../components/student/result/QuestionNavigator"
import WarningBanner from "../../components/student/result/WarningBanner";
import { useToast } from "../../components/ui/Toast";


export default function Result() {
  const { attemptId, schoolSlug } = useParams();
  const { showToast } = useToast();  
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [attempts, setAttempts] = useState([]);
  // ✅ Replace your current line with this
  const [selectedAttempt, setSelectedAttempt] = useState(attemptId); // ✅ start with URL param

  const [openIndex, setOpenIndex] = useState(null);
  const [quizCode, setQuizCode] = useState(null);
  const reviewSectionRef = useRef(null);
  const questionRefs = useRef({});
 // const [canTakeNextAttempt, setCanTakeNextAttempt] = useState(null);

  // ✅ First effect: load result
// Add a guard so loadResult only runs after attempts are set
  useEffect(() => {
    let ignore = false;

    const loadResult = async () => {
      try {
        setLoading(true);

        // ✅ don’t fetch until selectedAttempt is set by loadAttempts
        if (!selectedAttempt) return;

        const resultRes = await API.get(
          `/api/student/${schoolSlug}/attempt/${selectedAttempt}/result?review=true`,
          { withCredentials: true }
        );

        if (ignore) return;

        const data = resultRes.data.data;
        setResult(data);
        setQuizCode(data.quiz_code);
        setReview(data.review || null);

        // if (canTakeNextAttempt === null) {
        //   setCanTakeNextAttempt(data.can_take_next_attempt);
        //   console.log("canTakeNextAttempt (from API):", data.can_take_next_attempt);
        // }

        console.log("Final result data:", data);

      } catch (err) {
        console.log("RESULT ERROR:", err.response?.data || err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadResult();

    return () => {
      ignore = true;
    };
  }, [schoolSlug, selectedAttempt]);



// ✅ Second effect: load attempts
useEffect(() => {
  let ignore = false;

  const loadAttempts = async () => {
    try {
      if (!quizCode) return;

      const res = await API.get(
        `/api/student/${schoolSlug}/quiz/${quizCode}/attempts`,
        { withCredentials: true }
      );
      
      if (ignore) return;
      
      const attemptsData = res.data.data || [];
      setAttempts(attemptsData);
      
      // ✅ NEW: set selectedAttempt to the latest attempt
      if (attemptsData.length > 0) {
        const maxAttempt = attemptsData[attemptsData.length - 1]; 
        console.log("maxAttempt :", maxAttempt);
        //setSelectedAttempt(maxAttempt.attempt_id); 
        // setCanTakeNextAttempt(null);
        // ✅ persist across refresh
        
      }
       
    } catch (err) {
      console.log(err);
    }
  };

  loadAttempts();

  return () => {
    ignore = true;
  };
}, [schoolSlug, quizCode]);       // ✅ correct dependency


 

  // =========================
  // NEXT ATTEMPT
  // =========================
  const startNextAttempt = async () => {
    try {
      const res = await API.post(
        `/api/student/${schoolSlug}/attempt/${selectedAttempt}/next`
      );

      const newAttemptId = res.data.data.attempt_id;

      navigate(
        `/school/${schoolSlug}/attempt/${newAttemptId}/0`
      );
    } catch (err) {
      console.log(
        "NEXT ATTEMPT ERROR:",
        err.response?.data || err.message
      );
       showToast(err.response?.data?.message || "Unable to start next attempt", "error");
       
    }
  };

  // =========================
  // RESET STUDENT
  // =========================
  const registerAsNewStudent = async () => {
    try {
      await API.post("/api/student/reset-student");

      navigate(
        `/school/${schoolSlug}/quiz/${result.quiz_code}`
      );
    } catch (err) {
      console.log("RESET ERROR:", err.response?.data || err.message);
    }
  };



    const achievementText = useMemo(() => {
    return getAchievementText(
      result?.percentage || 0,
      result?.percentile || 0
    );
  }, [result?.percentage, result?.percentile]);


  
    const isPassed = (result?.percentage ?? 0) >= 33;


    
    const performanceTheme = useMemo(
    () => getPerformanceTheme(result?.percentage || 0),
    [result?.percentage]
  );


  const currentAttempt = useMemo(() => {
  return attempts.find(
    (a) => String(a.attempt_id) === String(selectedAttempt)
  );
}, [attempts, selectedAttempt]);



  const latestAttempt = useMemo(() => {
  if (!attempts.length || !result) return null;

  const latestNumber = Math.max(
    ...attempts.map((a) => a.attempt_number)
  );

  return {
    attemptNumber: latestNumber,
    maxAttempts: result.max_attempts,
    remainingAttempts: Math.max(
      result.max_attempts - latestNumber,
      0
    ),
    canTakeNextAttempt: latestNumber < result.max_attempts,
  };
}, [attempts, result]);
    // =========================
    // LOADING
    // =========================

    if (loading) {
    return <ResultSkeleton />;
  }
    if (!result) return <h3>No result found</h3>;
 

  return (
  <div className="min-h-screen bg-slate-50 animate-fade-in space-y-4">
    <ResultConfetti
  show={(result?.percentage ?? 0) >= 90}
/>
    <div className="max-w-6xl mx-auto px-4">
      {/* GLASS GRADIENT HEADER */}
      <div className="animate-fade-up">
     <ResultHeader
        result={result}
        currentAttempt={currentAttempt}
      />
      </div>

      

      {/* ATTEMPT DASHBOARD */}
      <div className="animate-fade-up delay-100">
      {attempts?.length > 1 && (
        <div className="mb-6 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-xl">
          <div className="bg-white rounded-3xl border shadow-sm p-5">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

              <div>
                <h3 className="inline-flex items-center justify-end gap-2 text-lg font-semibold text-slate-900">
                  <Target className="w-5 h-5" /> Attempts
                </h3>

                <p className="text-sm text-slate-500">
                  View previous attempts and track your overall progress.
                </p>
              </div>

              <span className="text-sm font-semibold text-indigo-600">
                {latestAttempt?.attemptNumber} / {latestAttempt?.maxAttempts} Used
              </span>

            </div>

            {/* Progress */}
            <div className="mt-5">

              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      ((latestAttempt?.attemptNumber || 0) /
                        (latestAttempt?.maxAttempts || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-sm">

                <span className="text-slate-600">
                  Attempt Progress
                </span>

                <span
                  className={`font-medium ${
                  latestAttempt?.canTakeNextAttempt
                    ? "text-green-600"
                    : "text-red-600"
                }`}
                >
                  {latestAttempt?.canTakeNextAttempt
                  ? `${latestAttempt.remainingAttempts} Attempt${
                      latestAttempt.remainingAttempts === 1 ? "" : "s"
                    } Remaining`
                  : "Maximum Attempts Reached"}
                </span>

              </div>

            </div>

            {/* Attempt Pills */}
            <div className="mt-6 flex gap-3 overflow-x-auto pb-1">

              {attempts.map((a, index) => {
                const isActive =
                  String(a.attempt_id) ===
                  String(selectedAttempt);

                return (
                  <button
                    key={a.attempt_id}
                    onClick={() =>
                      setSelectedAttempt(a.attempt_id)
                    }
                    className={`flex-shrink-0 rounded-2xl px-5 py-3 border transition-all duration-300 ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <div className="flex flex-col items-center">

                      <span className="text-xs opacity-80">
                        Attempt
                      </span>

                      <span className="text-lg font-bold">
                        {a.attempt_number}
                      </span>

                      {isActive && (
                        <span className="text-xs mt-1 opacity-90">
                          Viewing
                        </span>
                      )}

                    </div>
                  </button>
                );
              })}

            </div>

          </div>
        </div>
      )}
      </div>

      {/* HERO */}
      <div className="animate-fade-up delay-200">

      <HeroSection
          result={result}
          isPassed={isPassed}
          performanceTheme={performanceTheme}
          achievementText={achievementText}
      />
      </div>

      {/* Performance Summary */}
      <div className="animate-fade-up delay-300">
      <PerformanceSummary
          result={result}
      />
      </div>

      {/* WARNINGS */}
      <WarningBanner result={result} />

      {/* ACTION BAR */}

      <div className="mt-4 flex flex-col gap-4 animate-fade-up delay-400">

        {/* Main Actions Row */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Primary Action */}
          {latestAttempt?.canTakeNextAttempt ? (
            <button
              onClick={startNextAttempt}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
            >
              <ArrowRightCircle className="w-5 h-5" />
              Take Next Attempt
            </button>
          ) : (
            <div className="flex-1 px-6 py-3 rounded-xl font-medium bg-slate-100 border text-slate-500 text-center">
              Maximum Attempts Reached
            </div>
          )}

          {/* Secondary Action */}
          <button
            onClick={registerAsNewStudent}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            New Student
          </button>

                  </div>

        {/* Review Toggle (centered pill style) */}
        {result.review_enabled && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                      const next = !showReview;
                      setShowReview(next);
                      if (next) {
                        setTimeout(() => {
                          reviewSectionRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }, 100);
                      }
                    }}
              className={`
                inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300
                ${showReview
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {showReview ? (
                    <>
                      <EyeOff className="w-4 h-4" />  Hide Review
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />  Review Your Answers
                    </>
                  )}
            </button>
          </div>
        )}

      </div>

      {result.review_enabled &&
        showReview &&
        review?.questions?.length > 0 && (

          <>
        <QuestionNavigator
            questions={review.questions}
            questionRefs={questionRefs}
            setOpenIndex={setOpenIndex}
            openIndex={openIndex}

        />
          <div 
          ref={reviewSectionRef}
          className="mt-4 space-y-4"
          >

            {review.questions.map((q, index) => (
              <QuestionReviewCard
                key={index}
                q={q}
                index={index}
                openIndex={openIndex}
                setOpenIndex={setOpenIndex}
                 ref={(el) => {
                    questionRefs.current[q.question_id] = el;
                }}
              />
            ))}

          </div>
          </>
      )}

    </div>
  </div>
);
}