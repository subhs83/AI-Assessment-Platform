import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Send,
} from "lucide-react";

import { useExamStore } from "../../../store/examStore";

export default function ExamFooter({
  currentIndex,
  totalQuestions,
  isOffline,
  onPrev,
  onNext,
  openPalette,
}) {
  const setShowSubmitModal = useExamStore(
    (s) => s.setShowSubmitModal
  );

  const isLastQuestion =
    currentIndex >= totalQuestions - 1;

 return (
  <div className="border-t border-slate-200 pt-3">

    <div className="grid grid-cols-3 gap-3">

      {/* Previous */}
      <button
        onClick={onPrev}
        disabled={isOffline || currentIndex === 0}
        className="
          flex h-11 items-center justify-center gap-2
          rounded-2xl
          border border-slate-300
          bg-white
          text-sm
          font-medium
          text-slate-700
          transition-all

          hover:bg-slate-50
          hover:border-slate-400

          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronLeft size={18} />
        Previous
      </button>

      {/* Palette */}
      <button
        onClick={openPalette}
        className="
          flex h-11 items-center justify-center gap-2
          rounded-2xl
          bg-amber-100
          text-sm
          font-semibold
          text-amber-800
          transition-all

          hover:bg-amber-200
          active:scale-[0.98]

          lg:hidden
        "
      >
        <LayoutGrid size={18} />
        Palette
      </button>

      {/* Next / Submit */}
      {!isLastQuestion ? (
        <button
          onClick={onNext}
          disabled={isOffline}
          className="
            flex h-11 items-center justify-center gap-2
            rounded-2xl
            bg-indigo-600
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all

            hover:bg-indigo-700
            active:scale-[0.98]

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Next
          <ChevronRight size={18} />
        </button>
      ) : (
        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={isOffline}
          className="
            flex h-11 items-center justify-center gap-2
            rounded-2xl
            bg-emerald-600
            text-sm
            font-semibold
            text-white
            shadow-md
            transition-all

            hover:bg-emerald-700
            active:scale-[0.98]

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Send size={18} />
          Submit
        </button>
      )}

    </div>

  </div>
);
}