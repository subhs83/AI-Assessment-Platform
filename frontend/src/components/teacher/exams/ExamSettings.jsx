import {
  Clock,
  Award,
  MinusCircle,
  Repeat,
} from "lucide-react";

export default function ExamSettings({
  form,
  handleChange,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">

      {/* Duration */}

      <div>

        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Clock size={16} />
          Duration (minutes)
        </label>

        <input
          type="number"
          name="duration_minutes"
          value={form.duration_minutes}
          onChange={handleChange}
          min="1"
          required
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

      {/* Marks */}

      <div>

        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Award size={16} />
          Marks Per Question
        </label>

        <input
          type="number"
          name="marks"
          value={form.marks}
          onChange={handleChange}
          min="1"
          step="0.5"
          required
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

      {/* Negative */}

      <div>

        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MinusCircle size={16} />
          Negative Marks
        </label>

        <input
          type="number"
          name="negative"
          value={form.negative}
          onChange={handleChange}
          min="0"
          step="0.25"
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

      {/* Attempts */}

      <div>

        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Repeat size={16} />
          Max Attempts
        </label>

        <input
          type="number"
          name="max_attempts"
          value={form.max_attempts}
          onChange={handleChange}
          min="1"
          required
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

    </div>
  );
}