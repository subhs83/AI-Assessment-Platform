import { useParams, useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import { useExamStore } from "../../store/examStore";

import { useExamSecurity } from "../../hooks/useExamSecurity";
import { useExamQuestion } from "../../hooks/useExamQuestion";
import { usePalette } from "../../hooks/usePalette";
import { useExamTimer } from "../../hooks/useExamTimer";
import { useAnswerActions } from "../../hooks/useAnswerActions";
import { useSubmitExam } from "../../hooks/useSubmitExam";
import { useAutoSubmit } from "../../hooks/useAutoSubmit";
import { useOfflineDetector } from "../../hooks/useOfflineDetector";
import { useViolationTracker } from "../../hooks/useViolationTracker";
import { useFullscreenGuard } from "../../hooks/useFullscreenGuard";
import { useTabSwitchGuard } from "../../hooks/useTabSwitchGuard";
import { useRefreshGuard } from "../../hooks/useRefreshGuard";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useResumeFullscreen } from "../../hooks/useResumeFullscreen";

import OfflineBanner from "../../components/student/exam/OfflineBanner";
import FullscreenOverlay from "../../components/student/exam/FullscreenOverlay";
import ExamHeader from "../../components/student/exam/ExamHeader";
import QuestionCard from "../../components/student/exam/QuestionCard";
import ExamFooter from "../../components/student/exam/ExamFooter";
import SaveStatus from "../../components/student/exam/SaveStatus";
import SubmitExamModal from "../../components/student/exam/SubmitExamModal";
import PaletteDrawer from "../../components/student/exam/PaletteDrawer";
import QuestionPalette from "../../components/student/exam/QuestionPalette";
import LoadingOverlay from "../../components/common/LoadingOverlay";


export default function ExamPage() {
   useExamSecurity(); 
  const { schoolSlug, attemptId, index } = useParams();
  const [openPalette, setOpenPalette] = useState(false);
  const safeIndex = Number(index ?? 0);

  useExamQuestion({ schoolSlug, attemptId, index: safeIndex });

  const navigate = useNavigate();

  // =====================
  // STORE
  // =====================
  const currentQuestion = useExamStore((state) => state.currentQuestion);
  const answers = useExamStore((state) => state.answers);
  const currentIndex = useExamStore((state) => state.currentIndex);
  const remainingSeconds = useExamStore((state) => state.remainingSeconds);
  const violationCount = useExamStore((state) => state.violationCount);
  const isOffline = useExamStore((state) => state.isOffline);
  const fullscreenRequired = useExamStore((state) => state.fullscreenRequired);
  const saveStatus = useExamStore((state) => state.saveStatus);
  const saving = useExamStore((state) => state.saving);

  useEffect(() => {
    
    useExamStore.setState({
      currentIndex: Number(index),
    });
  }, [index]);


  useEffect(() => {
    // clear UI artifacts on navigation
    useExamStore.setState({
      saveStatus: "",
    });
  }, [safeIndex]);
  // =====================
  // HOOKS
  // =====================
  usePalette(schoolSlug, attemptId);
  useExamTimer();

  const { submitExam } = useSubmitExam(schoolSlug, attemptId);

  useAutoSubmit({
    remainingSeconds,
    currentQuestion,
    attemptId,
    submitExam,
  });

  const { saveAnswer } = useAnswerActions(schoolSlug, attemptId);

  useOfflineDetector();

  const { reportViolation } = useViolationTracker(schoolSlug, attemptId);

  useFullscreenGuard(reportViolation);
  useTabSwitchGuard(reportViolation);
  useRefreshGuard(schoolSlug, attemptId);

  useWakeLock();

  const { resumeFullscreen } = useResumeFullscreen();

  // =====================
  // LOADING
  // =====================
 if (!currentQuestion) {
  return (
    <LoadingOverlay message="Loading your exam..." />
  );
}
  // =====================
  // TIMER
  // =====================
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // =====================
  // NAVIGATION
  // =====================
  const goNext = () => {
    const next = Number(currentIndex) + 1;
    if (next < currentQuestion.total_questions) {
      navigate(`/school/${schoolSlug}/attempt/${attemptId}/${next}`);
    }
  };

  const goPrev = () => {
    const prev = Number(currentIndex) - 1;
    if (prev >= 0) {
      navigate(`/school/${schoolSlug}/attempt/${attemptId}/${prev}`);
    }
  };

  const selectedOption =
  answers?.[`${attemptId}_${safeIndex}`] ?? null;

  

  // =====================
  // UI
  // =====================
  return (
  <>
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      {/* OVERLAYS */}
      {isOffline && <OfflineBanner />}

      {fullscreenRequired && (
        <FullscreenOverlay
          violationCount={violationCount}
          onResume={resumeFullscreen}
        />
      )}

      <SubmitExamModal
        schoolSlug={schoolSlug}
        attemptId={attemptId}
      />

      <div className="select-none flex h-full flex-col">

        {/* HEADER */}
        <ExamHeader
          currentIndex={currentIndex}
          totalQuestions={currentQuestion.total_questions}
          formattedTime={formattedTime}
          violationCount={violationCount}
          remainingSeconds={remainingSeconds}
        />

        {/* CONTENT */}
        <div className="flex flex-1 overflow-hidden">

          <div className="mx-auto flex h-full w-full max-w-[1500px] gap-5 px-3 py-3 sm:px-5 sm:py-5">

            {/* ================= QUESTION SIDE ================= */}
            <div className="flex min-w-0 flex-1 flex-col">

              {/* Scrollable Question */}
              <div className="relative flex-1 overflow-y-auto pr-1">

                <QuestionCard
                    key={`${attemptId}_${safeIndex}`}   // 🔥 IMPORTANT FIX
                    question={currentQuestion}
                    questionNumber={safeIndex + 1}
                    selected={selectedOption}
                    saving={saving}
                    isOffline={isOffline}
                    onSelect={(option) => {
                      saveAnswer(
                        currentQuestion.question_id,
                        option,
                        currentIndex
                      );
                    }}
                  />

                <div className="absolute top-4 right-4 z-20">
                  <SaveStatus key={`${attemptId}-${currentIndex}`} status={saveStatus} />
                </div>

              </div>

              {/* Sticky Footer */}
             
                <ExamFooter
                  currentIndex={currentIndex}
                  totalQuestions={currentQuestion.total_questions}
                  isOffline={isOffline}
                  onPrev={goPrev}
                  onNext={goNext}
                  onSubmit={submitExam}
                  openPalette={() => setOpenPalette(true)}
                />


            </div>

            {/* ================= DESKTOP PALETTE ================= */}
            <aside className="hidden w-[290px] shrink-0 lg:block">

              <div className="sticky top-4 h-fit">

                <QuestionPalette
                  schoolSlug={schoolSlug}
                  attemptId={attemptId}
                  currentIndex={currentIndex}
                  isOffline={isOffline}
                />

              </div>

            </aside>

          </div>

        </div>

      </div>

    </div>

    <PaletteDrawer
      schoolSlug={schoolSlug}
      attemptId={attemptId}
      currentIndex={currentIndex}
      open={openPalette}
      onClose={() => setOpenPalette(false)}
      isOffline={isOffline}
    />
  </>
);
}