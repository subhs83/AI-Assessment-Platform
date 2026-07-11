import {
  FileText,
  Languages,
  Upload,
  CheckCircle2,
} from "lucide-react";

export default function AIFileSection({
  file,
  setFile,
  language,
  setLanguage,
  ocrLanguages,
  extracting,
  handleExtract,
  setExtractedContent,
  setSourceType,
  setWordCount,
  setCharacterCount,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">

      <div className="flex items-center gap-3 mb-4">

        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-600" />
        </div>

        <div>

          <h2 className="font-semibold text-lg">
            Generate from PDF or Image
          </h2>

          <p className="text-sm text-gray-500">
            Upload teaching material and generate questions using AI.
          </p>

          <p className="text-sm text-blue-600 mb-4">
            Recommended: PDF files usually provide the most accurate
            results.
          </p>

        </div>

      </div>

      {/* OCR Language */}

      <div className="mb-4">

        <div className="flex items-center gap-2 mb-1">

          <Languages className="w-4 h-4 text-indigo-600" />

          <label className="font-medium">
            Document Language
          </label>

        </div>

        <p className="text-xs text-gray-500 mb-2">
          Choose the language used in the uploaded document.
        </p>

        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {ocrLanguages.map((lang) => (
            <option
              key={lang.value}
              value={lang.value}
            >
              {lang.label}
            </option>
          ))}
        </select>

      </div>

      {/* Upload */}

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center mb-4 hover:border-indigo-400 transition">

        <Upload className="mx-auto w-8 h-8 text-indigo-500 mb-2" />

        <p className="font-medium">
          Upload PDF or Image
        </p>

        <p className="text-sm text-gray-500 mb-4">
          PDF • JPG • PNG
        </p>

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setExtractedContent("");
            setSourceType("");
            setWordCount(0);
            setCharacterCount(0);
          }}
          className="mx-auto"
        />

      </div>

      {file && (

        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm mb-4">

          <CheckCircle2 className="w-4 h-4" />

          <span>{file.name}</span>

        </div>

      )}

      <button
        type="button"
        onClick={handleExtract}
        disabled={!file || extracting}
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition disabled:opacity-50"
      >
        {extracting
          ? "Extracting..."
          : "Extract Content"}
      </button>

    </div>
  );
}