import { useState } from "react";
import Button from "../../ui/Button";

import {
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Table2,
} from "lucide-react";

export default function TemplateDownloadCard({
  onDownload,
}) {
  const [showInstructions, setShowInstructions] =
    useState(false);

  return (
    <div className="border rounded-xl bg-blue-50 shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Sample Excel Template
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            Download the template and replace only the content
            while keeping the same format.
          </p>
        </div>

        <Button
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          <Download size={18} />
          Download Sample File
        </Button>

      </div>

      {/* Toggle */}
      <button
        onClick={() =>
          setShowInstructions(!showInstructions)
        }
        className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition"
      >
        {showInstructions ? (
          <>
            <ChevronUp size={16} />
            Hide Instructions
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            Show Instructions
          </>
        )}
      </button>

      {showInstructions && (
        <div className="mt-5 border-t pt-5">

          <div className="space-y-3 text-sm text-gray-700">

            <Instruction>
              Replace only question and option values.
            </Instruction>

            <Instruction>
              Keep the same column names.
            </Instruction>

            <Instruction>
              Do not rename, remove, or reorder columns.
            </Instruction>

            <Instruction>
              Keep only the questions you want to import and
              delete the remaining sample rows.
            </Instruction>

            <Instruction>
              Correct answer should be A, B, C or D.
            </Instruction>

            <Instruction>
              Supported formats: .xlsx and .xls.
            </Instruction>

          </div>

          <div className="mt-5 bg-white border rounded-xl p-4">

            <div className="flex items-center gap-2 mb-3 font-semibold text-gray-800">
              <Table2 size={18} />
              Required Columns
            </div>

            <div className="overflow-x-auto">

              <div className="inline-flex gap-2 whitespace-nowrap font-mono text-xs md:text-sm">

                <Column>question_text</Column>
                <Column>option_a</Column>
                <Column>option_b</Column>
                <Column>option_c</Column>
                <Column>option_d</Column>

                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                  correct_option
                </span>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function Instruction({ children }) {
  return (
    <div className="flex gap-2">
      <CheckCircle2
        size={18}
        className="text-green-600 flex-shrink-0 mt-0.5"
      />
      <span>{children}</span>
    </div>
  );
}

function Column({ children }) {
  return (
    <span className="bg-gray-100 px-2 py-1 rounded">
      {children}
    </span>
  );
}