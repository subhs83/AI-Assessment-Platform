import { BookOpen, WifiOff, } from "lucide-react";
import QuestionOptions from "./QuestionOptions";

export default function QuestionCard({
  question,
  questionNumber,
  selected,
  saving,
  isOffline,
  onSelect,
}) 

{
  return (
  <div
    className="
      relative
      overflow-hidden
      rounded-3xl
      border border-white/70
      bg-white/90
      backdrop-blur-xl
      shadow-xl
      p-2
      md:p-2
      flex
      flex-col
      gap-4
    "
  >
    {/* Decorative Background */}
    <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-indigo-100/40 blur-3xl" />

    {/* ================= Header ================= */}
    <div className="relative z-10 flex items-start justify-between gap-3">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100">
          <BookOpen
            size={20}
            className="text-indigo-600"
          />
        </div>

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Question {questionNumber}
          </p>

        </div>

      </div>

      <div className="flex flex-col items-end gap-2">

        {isOffline && (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <WifiOff size={13} />
            Offline
          </div>
        )}


      </div>

    </div>

    {/* ================= Question ================= */}

    <div className="relative z-10">

      <h2
        className="
          text-base
          leading-7
          font-semibold
          text-slate-900
          whitespace-pre-wrap
          break-words
          md:text-lg
          md:leading-7
        "
      >
        {question.question_text}
      </h2>

    </div>

    {/* Divider */}

    <div className="relative z-10 border-t border-slate-200/70" />

    {/* ================= Options ================= */}

    <div className="relative z-10">

      <QuestionOptions
        key={question?.question_id}   // forces clean reset
        options={question.options}
        selected={selected}           // IMPORTANT: no conditional filtering
        saving={saving}
        isOffline={isOffline}
        onSelect={onSelect}
      />

    </div>

  </div>
);
}