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
    <div
      ref={extractRef}
      className="border rounded-lg p-4 mb-6"
    >
      <h2 className="font-semibold text-lg mb-2">
        Review Extracted Content
      </h2>

      <p className="text-sm text-gray-600 mb-3">
        Please review the extracted content before generating
        questions. For image files, you may need to make small
        corrections before generating questions.
      </p>

      <div className="text-sm text-green-600 mb-3">
        ✓ Content extracted successfully
      </div>

      <div className="text-sm text-gray-500 mb-3">
        Words: {wordCount} • Characters: {characterCount}
      </div>

      <div className="text-green-600 text-sm mb-2">
        ✓ Content ready for review
      </div>

      <textarea
        className="w-full border rounded p-3 h-72"
        value={extractedContent}
        onChange={(e) =>
          setExtractedContent(e.target.value)
        }
      />
    </div>
  );
}