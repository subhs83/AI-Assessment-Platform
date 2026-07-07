import { FileText } from "lucide-react";

export default function ExamBasicInfo({
  form,
  handleChange,
  children,
}) {
  return (
    <div className="space-y-6">

      {/* ================= BASIC INFO ================= */}

      <div className="border rounded-lg p-4">
        <div>

          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <FileText size={16} />
            Exam Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Mathematics Chapter 1 Test"
            required
            className="
              w-full
              border
              rounded-lg
              px-3
              py-2
              focus:ring-2
              focus:ring-indigo-500
            "
          />

        </div>

      </div>

      {/* ================= ACADEMIC TARGET ================= */}

      {children}

    </div>
  );
}