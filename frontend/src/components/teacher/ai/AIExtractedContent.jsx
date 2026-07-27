export default function AIExtractedContent({
  extractRef,
  extractedContent,
  setExtractedContent,
  wordCount,
  characterCount,
}) {
  if (!extractedContent) {
    return null;
  }

  return (
    <section
      ref={extractRef}
      className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Review Extracted Content
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review and correct the extracted text before generating
            AI questions.
          </p>

        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          ✓ Ready
        </span>

      </div>

      {/* Statistics */}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">

        <div className="rounded-xl bg-slate-100 px-3 py-2">
          <span className="text-slate-500">Words</span>

          <span className="ml-2 font-semibold text-slate-900">
            {wordCount}
          </span>
        </div>

        <div className="rounded-xl bg-slate-100 px-3 py-2">
          <span className="text-slate-500">
            Characters
          </span>

          <span className="ml-2 font-semibold text-slate-900">
            {characterCount}
          </span>
        </div>

      </div>

      {/* Editor */}

      <textarea
        className="
          mt-5
          h-72
          w-full
          resize-y
          rounded-2xl
          border
          border-slate-300
          p-4
          text-sm
          leading-6
          text-slate-800
          placeholder:text-slate-400
          focus:border-indigo-500
          focus:outline-none
          focus:ring-4
          focus:ring-indigo-100
        "
        value={extractedContent}
        onChange={(e) =>
          setExtractedContent(e.target.value)
        }
      />
    </section>
  );
}