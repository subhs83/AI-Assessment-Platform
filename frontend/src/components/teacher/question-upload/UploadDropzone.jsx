import { UploadCloud, X, FileSpreadsheet } from "lucide-react";

export default function UploadDropzone({
  file,
  setFile,
}) {
  return (
    <div
      className="
        rounded-2xl
        border-2
        border-dashed
        border-blue-300
        bg-blue-50/70
        p-5
        transition-all
        duration-200
        hover:border-blue-500
        hover:bg-blue-100/70
      "
    >

      {!file ? (
        <div className="flex flex-col items-center text-center">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-blue-100">
            <UploadCloud
              size={38}
              className="text-blue-600"
            />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Upload Question Template
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Select the completed Excel template to import questions into your exam
             <span className="font-medium">.xlsx</span> and{" "}
            <span className="font-medium">.xls</span> files are supported.
          </p>

          <label className="mt-6 cursor-pointer">

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className="hidden"
            />

            <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">
              <UploadCloud size={18} />
              Choose Excel File
            </span>

          </label>

        </div>
      ) : (

        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
              <FileSpreadsheet
                size={22}
                className="text-green-600"
              />
            </div>

            <div className="min-w-0">

              <p className="truncate font-medium text-slate-800">
                {file.name}
              </p>

              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => setFile(null)}
            className="rounded-lg p-2 text-red-500 transition hover:bg-red-100"
          >
            <X size={18} />
          </button>

        </div>

      )}

    </div>
  );
}