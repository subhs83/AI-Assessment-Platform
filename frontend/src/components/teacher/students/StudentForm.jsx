import Input from "../../ui/Input";

export default function StudentForm({
  values,
  errors = {},
  onChange,
  clearError,
}) {
  const handleChange = (field, value) => {

  onChange({
    ...values,
    [field]: value,
  });

  // SAFE CALL
  if (typeof clearError === "function") {
    clearError(field);
  }
};

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="First Name"
          required
          value={values.first_name}
          error={errors.first_name}
          onChange={(e) =>
            handleChange("first_name", e.target.value)
          }
        />

        <Input
          label="Last Name"
          value={values.last_name}
          error={errors.last_name}
          onChange={(e) =>
            handleChange("last_name", e.target.value)
          }
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="Class"
          required
          placeholder="e.g. 10A"
          value={values.student_class}
          error={errors.student_class}
          onChange={(e) =>
            handleChange("student_class", e.target.value)
          }
        />

        <Input
          label="Roll Number"
          required
          placeholder="e.g. 23"
          value={values.roll_number}
          error={errors.roll_number}
          onChange={(e) =>
            handleChange("roll_number", e.target.value)
          }
        />

      </div>

      <Input
        label="Mobile"
        placeholder="9876543210"
        value={values.mobile}
        error={errors.mobile}
        onChange={(e) =>
          handleChange("mobile", e.target.value)
        }
      />

    </div>
  );
}