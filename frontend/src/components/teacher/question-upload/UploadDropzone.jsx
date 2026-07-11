import { UploadCloud, X } from "lucide-react";

export default function UploadDropzone({
  file,
  setFile,
}) {
  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition">

      {!file ? (
        <>
          <UploadCloud
            className="mx-auto text-gray-400"
            size={32}
          />

          <p className="text-sm text-gray-600 mt-2">
            Drag & drop Excel file here or click to select
          </p>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
            className="mt-4 block w-full text-sm"
          />
        </>
      ) : (
        <div className="flex items-center justify-between bg-white border rounded-lg p-3">

          <span className="text-sm font-medium truncate">
            {file.name}
          </span>

          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>

        </div>
      )}

    </div>
  );
}