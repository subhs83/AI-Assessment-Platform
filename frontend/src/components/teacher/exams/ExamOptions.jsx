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
        showPlaceholder={false}
        options={[
          {
            value: "no_review",
            label: "No Review",
          },
          {
            value: "questions_only",
            label: "Question Only",
          },
          {
            value: "full_review",
            label: "Full Review",
          },
        ]}
        helperText={
        {
          no_review:
            "Students can only view their score and summary.",
          questions_only:
            "Students can review questions and their submitted answers. Correct answers and explanations remain hidden.",
          full_review:
            "Students can review questions, correct answers, and explanations after submission.",
        }[form.review_mode] ?? "Please choose a valid review mode."
      }
      />
    </div>
  );
}