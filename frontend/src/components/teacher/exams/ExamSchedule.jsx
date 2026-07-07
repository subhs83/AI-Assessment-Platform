import { Calendar } from "lucide-react";

export default function ExamSchedule({
  form,
  handleChange,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">

      {/* Start Date */}

      <div>

        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Calendar size={16} />
          Start Date
        </label>

        <input
          type="datetime-local"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

      {/* End Date */}

      <div>

        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Calendar size={16} />
          End Date
        </label>

        <input
          type="datetime-local"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

    </div>
  );
}