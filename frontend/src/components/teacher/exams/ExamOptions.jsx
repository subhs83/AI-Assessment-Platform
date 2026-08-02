import Select from "../../ui/Select";

export default function ExamOptions({
  form,
  handleChange,
}) {
  return (
    <div className="border rounded-lg p-3">
      <Select
        label="Review Mode"
        name="review_mode"
        value={form.review_mode}
        onChange={handleChange}
        options={[
          {
            value: "no_review",
            label: "No Review",
          },
          {
            value: "questions_only",
            label: "Questions Only",
          },
          {
            value: "full_review",
            label: "Full Review",
          },
        ]}
        helperText={
          form.review_mode === "no_review"
            ? "Students can only view their score and summary."
            : form.review_mode === "questions_only"
            ? "Students can review questions and their submitted answers. Correct answers and explanations remain hidden."
            : "Students can review questions, correct answers, and explanations after submission."
        }
      />
    </div>
  );
}