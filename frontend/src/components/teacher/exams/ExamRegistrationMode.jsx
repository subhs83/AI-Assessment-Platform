import { UserCheck } from "lucide-react";

export default function ExamRegistrationMode({
  value,
  onChange,
}) {
  return (
    <div className="border rounded-lg p-4">

      <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <UserCheck size={16} />
        Registration Mode
      </h3>

      <div className="flex flex-col md:flex-row gap-4">

        <label
          className="
            flex items-start gap-3
            border rounded-lg p-4
            cursor-pointer
            hover:border-indigo-500
            flex-1
          "
        >
          <input
            type="radio"
            name="registration_mode"
            value="open"
            checked={value === "open"}
            onChange={onChange}
            className="mt-1"
          />

          <div>
            <p className="font-medium">
              Open Registration
            </p>

            <p className="text-sm text-gray-500">
              Any student can register and take this quiz.
            </p>
          </div>
        </label>

        <label
          className="
            flex items-start gap-3
            border rounded-lg p-4
            cursor-pointer
            hover:border-indigo-500
            flex-1
          "
        >
          <input
            type="radio"
            name="registration_mode"
            value="verified"
            checked={value === "verified"}
            onChange={onChange}
            className="mt-1"
          />

          <div>
            <p className="font-medium">
              Verified Students Only
            </p>

            <p className="text-sm text-gray-500">
              Only students already added by the school can take this quiz.
            </p>
          </div>
        </label>

      </div>

    </div>
  );
}