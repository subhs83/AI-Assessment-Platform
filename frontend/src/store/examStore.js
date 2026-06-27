import { create } from "zustand";

export const useExamStore = create((set) => ({
  // ======================
  // SESSION INFO
  // ======================
  attemptId: null,
  examId: null,
  schoolSlug: null,
  isSubmittingExam: false,
  // ======================
  // EXAM INFO
  // ======================
  totalQuestions: 0,

  // ======================
  // QUESTION STATE
  // ======================
  currentQuestion: null,

  // Cache questions to reduce refetches
  questionCache: {},

  // ======================
  // ANSWERS
  // ======================
  answers: {},

  // ======================
  // TIMER + VIOLATIONS
  // ======================
  remainingSeconds: 0,
  violationCount: 0,

  // ======================
  // UI STATE
  // ======================
  loading: false,
  saving: false,
  isOffline: false,
  fullscreenRequired: false,
  saveStatus: "",

  // ======================
// INIT SESSION (IMPORTANT FIX)
// ======================
initSession: (payload) => {
  set({
    attemptId: payload.attempt_id,
    examId: payload.exam_id,
    schoolSlug: payload.schoolSlug,
    totalQuestions: payload.total_questions || 0,

    // 🔥 IMPORTANT: RESET OLD QUIZ DATA
    currentIndex: 0,
    currentQuestion: null,
    questionCache: {},
    answers: {},          // reset answers
    palette: [],          // reset palette
    remainingSeconds: 0,
    violationCount: 0,
    isSubmittingExam: false,
    submitModalOpen: false,
    showSubmitModal: false
    
  });
},

  // ======================
  // QUESTION DATA
  // ======================
  setQuestion: (index, data) => {
    set((state) => ({
      currentQuestion: data,

      totalQuestions:
        data.total_questions ??
        state.totalQuestions,

      remainingSeconds:
        data.remaining_seconds ?? 0,

      violationCount:
        data.violation_count ?? 0,

      questionCache: {
        ...state.questionCache,
        [index]: data,
      },
      // 🔥 IMPORTANT SAFETY RESET (fix ghost selection bug)
      currentIndex: index,
    }));
  },

  // ======================
  // ANSWER STATE
  // ======================
  setAnswer: (index, option, attemptId) => {
    console.log("STORE HIT:", { index, option, attemptId });
    set((state) => ({
      answers: {
        ...state.answers,
        [`${attemptId}_${index}`]: option,
      },
    }));
  },

  // ======================
  // TIMER
  // ======================
  tick: () => {
    set((state) => ({
      remainingSeconds: Math.max(
        0,
        state.remainingSeconds - 1
      ),
    }));
  },

  setRemainingSeconds: (seconds) => {
    set({
      remainingSeconds: seconds,
    });
  },

  // ======================
  // VIOLATIONS
  // ======================
  setViolationCount: (count) => {
    set({
      violationCount: count,
    });
  },

  // ======================
  // UI HELPERS
  // ======================
  setLoading: (loading) => {
    set({ loading });
  },

  setSaving: (saving) => {
    set({ saving });
  },

  setOffline: (isOffline) => {
    set({ isOffline });
  },

  setFullscreenRequired: (
    fullscreenRequired
  ) => {
    set({ fullscreenRequired });
  },

  setSaveStatus: (saveStatus) => {
    set({ saveStatus });
  },

  // ======================
  // RESET EXAM
  // ======================
  reset: () => {
    set({
      attemptId: null,
      examId: null,
      schoolSlug: null,

      totalQuestions: 0,

      currentQuestion: null,
      questionCache: {},

      answers: {},
      palette: [],
      remainingSeconds: 0,
      violationCount: 0,

      loading: false,
      saving: false,
      isOffline: false,
      fullscreenRequired: false,
      saveStatus: "",
      isSubmittingExam: false,
      showSubmitModal: false,
      submitModalOpen: false
    });
  },

  // ======================
  // Upadate Palette Questions
  // ======================
  palette: [],

  setPalette: (palette) =>
    set({
      palette,
    }),

  updatePaletteQuestion: (index) =>
  set((state) => {
    console.log(
      "UPDATING PALETTE:",
      index
    );

    return {
      palette: state.palette.map((q) =>
        q.index === index
          ? {
              ...q,
              status: "answered",
            }
          : q
      ),
    };
  }),

 // ======================
  // submission lock
  // ======================

setSubmittingExam: (value) =>
  set(() => ({
    isSubmittingExam: value,
  })),

   // ======================
  // Submit Model
  // ======================
  showSubmitModal: false,
  setShowSubmitModal: (value) => set({ showSubmitModal: value }),

submitModalOpen: false,
setSubmitModalOpen: (value) => set({ submitModalOpen: value }),


}))

