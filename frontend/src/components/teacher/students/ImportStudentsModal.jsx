import { useState } from "react";
import ConfirmModal from "../../ui/ConfirmModal";
import { useTeacherStore } from "../../../store/teacherStore";
import { useToast } from "../../ui/Toast";

export default function ImportStudentsModal({
  open,
  onClose,
  schoolSlug,
  refresh,
}) {
  const importStudents = useTeacherStore(
    (s) => s.importStudents
  );

  const { showToast } = useToast();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  

  const handleImport = async () => {

    if (!file) {
        showToast(
            "Please select an Excel file.",
            "error"
        );
        return;
    }

    try {
        console.log("Uploading file:", file);
        setLoading(true);

        const response = await importStudents(
            schoolSlug,
            file
        );

        showToast(
            response.message,
            "success"
        );

        setImportResult(response.data);

        refresh();

    } catch (err) {

        showToast(
            err.response?.data?.message ||
            "Import failed.",
            "error"
        );

    } finally {

        setLoading(false);

    }
};


  return (
    <ConfirmModal
      open={open}
      title="Import Students"
      confirmText={
                    importResult ? "Done" : loading ? "Importing..." : "Import Students"
                  }
      cancelText="Cancel"
      onClose={() => {
                  setFile(null);
                  setImportResult(null);
                  onClose();
              }}
      onConfirm={() => {
                    if (importResult) {
                        setFile(null);
                        setImportResult(null);
                        onClose();
                        return;
                    }

                    handleImport();
                }}
    >
      <div className="space-y-4">

  {!importResult ? (
    <>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      {file && (
        <p className="text-sm text-gray-600">
          Selected: {file.name}
        </p>
      )}
    </>
  ) : (
    <div className="space-y-4">

      <div className="rounded-xl bg-green-50 border border-green-200 p-4">

        <h4 className="font-semibold text-green-700">
          Import Completed
        </h4>

        <div className="mt-3 space-y-2 text-sm">

          <p>
            ✅ Created:
            <strong> {importResult.created}</strong>
          </p>

          <p>
            ⚠️ Duplicates Skipped:
            <strong> {importResult.skipped_duplicates}</strong>
          </p>

          <p>
            ❌ Invalid Rows:
            <strong> {importResult.invalid_rows.length}</strong>
          </p>

        </div>

      </div>

      {importResult.invalid_rows.length > 0 && (

        <div className="max-h-48 overflow-y-auto rounded-lg border p-3">

          <h5 className="font-medium mb-2">
            Invalid Rows
          </h5>

          <ul className="space-y-2 text-sm">

            {importResult.invalid_rows.map((row) => (

              <li key={row.row}>

                <strong>Row {row.row}</strong>

                {" — "}

                {row.reason}

              </li>

            ))}

          </ul>

        </div>

      )}

    </div>
  )}

</div>
    </ConfirmModal>
  );
}