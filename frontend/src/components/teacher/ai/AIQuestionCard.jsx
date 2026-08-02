import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import aiApi from "../../../api/aiApi";
import { useToast } from "../../ui/Toast";

export default function AIQuestionCard({
  question,
  index,
  selected,
  onToggle,

  schoolSlug,
  requestId,
  onQuestionUpdated,
}) {

/* -------------------------------------------------------------------------- */
/* State */
/* -------------------------------------------------------------------------- */
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(question);


 /* -------------------------------------------------------------------------- */
  /* Effects */
  /* -------------------------------------------------------------------------- */


  useEffect(() => {
  setForm(question);
}, [question]);


  /* -------------------------------------------------------------------------- */
  /* Event Handlers */
  /* -------------------------------------------------------------------------- */


const handleEdit = () => {
  setForm(question);
  setIsEditing(true);
};

const handleCancel = () => {
  setForm(question);
  setIsEditing(false);
};


// Helpers
const validateForm = () => {

  if (!form.question_text.trim()) {
    showToast("Question is required", "error");
    return false;
  }

  if (!form.option_a.trim()) {
    showToast("Option A is required", "error");
    return false;
  }

  if (!form.option_b.trim()) {
    showToast("Option B is required", "error");
    return false;
  }

  if (!form.option_c.trim()) {
    showToast("Option C is required", "error");
    return false;
  }

  if (!form.option_d.trim()) {
    showToast("Option D is required", "error");
    return false;
  }

  if (!form.correct_answer) {
    showToast("Please select the correct answer", "error");
    return false;
  }

  return true;

};

/* -------------------------------------------------------------------------- */
/* Render Helpers */
/* -------------------------------------------------------------------------- */

const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};



const handleApply = async () => {

  if (!validateForm()) {
    return;
  }

  try {

    setSaving(true);

    const res = await aiApi.updateQuestion(
      schoolSlug,
      requestId,
      index,
      form
    );
    console.log("Updated Question:", res.data.question);
    onQuestionUpdated(
      index,
      res.data.question
    );

    showToast(
      "Question updated successfully",
      "success"
    );

    setIsEditing(false);

  } catch (err) {

    showToast(
      err?.response?.data?.message ||
      "Failed to update question",
      "error"
    );

  } finally {

    setSaving(false);

  }

};


/* -------------------------------------------------------------------------- */
/* Render */
/* -------------------------------------------------------------------------- */

const renderPreviewMode = () => {
  return (
    
      <div className="w-full">

        {/* Header Row */}
        <div className="mb-2 flex items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4 cursor-pointer"
            />

            <span className="text-sm font-semibold text-blue-700">
              Question {index + 1}
            </span>

          </div>


          <div className="flex items-center gap-2">

            {question.is_edited && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                ✓ Edited
              </span>
            )}

            <button
              type="button"
              onClick={handleEdit}
              className="
                flex items-center gap-1
                rounded-md border
                px-3 py-1.5
                text-sm font-medium
                text-blue-600
                transition
                hover:bg-blue-50
              "
            >
              <Pencil size={16} />
              Edit
            </button>

          </div>

        </div>


        {/* Question Content */}
        <h3 className="text-base font-semibold leading-7 text-slate-800">
          {question.question_text}
        </h3>

        {/* Options */}
        <div className="mt-4 space-y-2 text-sm text-slate-700">

          <div>
            <span className="font-medium">A.</span>{" "}
            {question.option_a}
          </div>

          <div>
            <span className="font-medium">B.</span>{" "}
            {question.option_b}
          </div>

          <div>
            <span className="font-medium">C.</span>{" "}
            {question.option_c}
          </div>

          <div>
            <span className="font-medium">D.</span>{" "}
            {question.option_d}
          </div>

        </div>

        {/* Correct Answer */}
        <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          Correct Answer: {question.correct_answer}
        </div>

        {question.explanation?.trim() && (
          <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
            <h4 className="mb-1 text-sm font-semibold text-indigo-700">
              Answer Explanation
            </h4>

            <p className="text-sm leading-6 text-slate-700">
              {question.explanation}
            </p>
          </div>
        )}

      </div>
  );
};


const renderEditMode = () => {
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">

        <span
          className="
            rounded-md bg-amber-100
            px-2 py-1
            text-xs font-semibold
            text-amber-700
          "
        >
          Editing Q{index + 1}
        </span>

      </div>

      {/* Question */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Question
        </label>

        <textarea
          name="question_text"
          value={form.question_text}
          onChange={handleChange}
          rows={3}
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        />
      </div>

      {/* Option A */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Option A
        </label>

        <input
          type="text"
          name="option_a"
          value={form.option_a}
          onChange={handleChange}
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        />
      </div>

      {/* Option B */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Option B
        </label>

        <input
          type="text"
          name="option_b"
          value={form.option_b}
          onChange={handleChange}
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        />
      </div>

      {/* Option C */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Option C
        </label>

        <input
          type="text"
          name="option_c"
          value={form.option_c}
          onChange={handleChange}
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        />
      </div>

      {/* Option D */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Option D
        </label>

        <input
          type="text"
          name="option_d"
          value={form.option_d}
          onChange={handleChange}
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        />
      </div>

      {/* Correct Answer */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Correct Answer
        </label>

        <select
          name="correct_answer"
          value={form.correct_answer}
          onChange={handleChange}
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Answer Explanation
          <span className="ml-1 text-xs font-normal text-slate-500">
            (Optional)
          </span>
        </label>

        <textarea
          name="explanation"
          value={form.explanation || ""}
          onChange={handleChange}
          rows={3}
          placeholder="Explain why the correct answer is correct (optional)"
          className="
            w-full rounded-lg border
            px-3 py-2
            focus:border-blue-500
            focus:outline-none
          "
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">

        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="
            rounded-lg border
            px-4 py-2
            text-sm font-medium
            hover:bg-gray-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleApply}
          disabled={saving}
          className="
            rounded-lg bg-blue-600
            px-4 py-2
            text-sm font-medium
            text-white
            hover:bg-blue-700
          "
        >
          Apply
        </button>

      </div>

    </div>
  );
};

  return (
  <div
    className={`
      rounded-2xl border border-slate-200 p-4 shadow-sm transition shadow-sm transition
      ${
        selected
          ? "bg-blue-50 ring-2 ring-blue-500"
          : "bg-white"
      }
    `}
  >
    {isEditing
      ? renderEditMode()
      : renderPreviewMode()}
  </div>
);
}