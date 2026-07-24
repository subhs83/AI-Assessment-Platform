import {
  ClipboardList,
  RefreshCw,
  Save,
} from "lucide-react";

import Button from "../../ui/Button";
import AIPrintButton from "./AIPrintButton";

export default function AISaveBar({
  selected,
  saving,
  selectedExam,
  setSelectedExam,
  exams,
  onGenerateNewSet,
  onSave,
  onPrint
}) {
  return (
    <div
      className="
        sticky
        bottom-0
        z-20
        mt-6
        border-t
        bg-white
        p-4
        shadow-lg
      "
    >

      <div className="mx-auto max-w-5xl">

        {selected.length === 0 && (

          <div className="mb-3 text-sm text-amber-600">
            Select at least one question to save.
          </div>

        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-end">

          <div className="flex-1">

            <label className="mb-2 flex items-center gap-2 font-medium">

              <ClipboardList size={16} />

              Select Exam

            </label>

            <select
              value={selectedExam}
              onChange={(e) =>
                setSelectedExam(e.target.value)
              }
              className="w-full rounded-lg border p-2"
            >

              <option value="">
                -- Select Exam --
              </option>

              {exams.map((exam) => (

                <option
                  key={exam.exam_uid}
                  value={exam.exam_id}
                >
                  {exam.title}
                </option>

              ))}

            </select>

          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            <Button
              variant="secondary"
              onClick={onGenerateNewSet}
            >

              <RefreshCw size={16} />

              Generate New Set

            </Button>

            <AIPrintButton
              onPrint={(value) => {
                // console.log("AISaveBar", value);
                onPrint(value);
              }}
            />

            <Button
              variant="success"
              onClick={onSave}
              disabled={
                saving ||
                selected.length === 0 ||
                !selectedExam
              }
            >

              <Save size={16} />

              {saving
                ? "Saving..."
                : "Save Selected Questions"}

            </Button>

          </div>

        </div>

      </div>

    </div>
  );
}