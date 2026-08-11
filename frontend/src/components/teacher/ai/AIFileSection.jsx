
import { useRef } from "react";

import {
  FileText,
  Languages,
  Upload,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";

export default function AIFileSection({
  file,
  setFile,
  language,
  setLanguage,
  ocrLanguages,
}) {
  const fileInputRef = useRef(null);

  return (
    <div>

      {/* Header */}
      <div className="mb-4 flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <FileText className="w-5 h-5 text-green-600" />
        </div>

        <div>

          <h2 className="font-semibold text-lg">
            Generate from  PDF  or  Image
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload teaching material and generate questions directly using AI.
          </p>

          {/* <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">

            <p className="text-sm text-blue-700">
              <span className="font-semibold">
                💡 Best Results:
              </span>{" "}
              PDF files usually provide the most complete context for
              AI-generated questions.
            </p>

          </div> */}

        </div>

      </div>

      {/* Document Language */}
      <div className="mb-5">

        <div className="mb-1 flex items-center gap-2">

          <Languages className="h-4 w-4 text-indigo-600" />

          <label className="font-medium">
            Document Language
          </label>

        </div>

        <p className="mb-2 text-xs text-gray-500">
          Choose the language used in the uploaded document.
          This language will be used for question generation.
        </p>

        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
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
      <div className="mb-5 rounded-2xl border-2 border-dashed border-green-300 bg-gradient-to-br from-blue-40 to-white p-4 text-center transition hover:border-green-500 hover:bg-indigo-50/70">

        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100">
          <UploadCloud className="h-7 w-7 text-indigo-600" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
          Upload PDF or Image
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Drag & drop your file here or choose from your device.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Supports PDF, JPG and PNG
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const selectedFile =
              e.target.files?.[0] || null;

            setFile(selectedFile);
          }}
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
        >
          <Upload className="h-4 w-4" />
          Choose File
        </button>

      </div>

      {/* Selected File */}
      {file && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div>

                <p className="font-medium text-slate-900">
                  {file.name}
                </p>

                <p className="text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Remove
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

