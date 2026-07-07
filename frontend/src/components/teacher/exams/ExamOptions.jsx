export default function ExamOptions({
  form,
  handleChange,
}) {
  return (
    <div className="border rounded-lg p-3">

      <label className="flex items-center gap-3 text-sm">

        <input
          type="checkbox"
          name="show_result_review"
          checked={form.show_result_review}
          onChange={handleChange}
          className="w-4 h-4"
        />

        <span>
          Allow Detailed Result Review
        </span>

      </label>

    </div>
  );
}