import {
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

import { useExamStore } from "../../../store/examStore";
import { useSubmitExam } from "../../../hooks/useSubmitExam";

export default function SubmitExamModal({
  schoolSlug,
  attemptId,
}) {
  const show = useExamStore((s) => s.showSubmitModal);
  const setShow = useExamStore((s) => s.setShowSubmitModal);

  const { submitExam } = useSubmitExam(
    schoolSlug,
    attemptId
  );

  if (!show) return null;

  const handleSubmit = async () => {
    try {
      setShow(false);
      await submitExam(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-5">

      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 text-center text-white">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">

            <ClipboardCheck size={34} />

          </div>

          <h2 className="text-2xl font-bold">
            Submit Exam
          </h2>

          <p className="mt-2 text-sm text-indigo-100">
            Please review before submitting.
          </p>

        </div>

        {/* Body */}
        <div className="space-y-5 p-6">

          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">

            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>

              <h3 className="font-semibold text-slate-900">
                Final Confirmation
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Once you submit your exam:
              </p>

              <ul className="mt-3 space-y-2 text-sm text-slate-600">

                <li>• You cannot change your answers.</li>

                <li>• The exam will end immediately.</li>

                <li>• Your responses will be submitted for evaluation.</li>

              </ul>

            </div>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => setShow(false)}
              className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue Exam
            </button>

            <button
              onClick={handleSubmit}
              className="flex-1 rounded-2xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              Submit Exam
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}