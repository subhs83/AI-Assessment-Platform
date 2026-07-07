import Input from "../../ui/Input";
import Select from "../../ui/Select";

export default function StudentForm({
  values,
  errors = {},
  onChange,
  clearError,
  schoolClasses,
  sections,
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

        <Select
          label="Class"
          required
          value={values.school_class_id}
          error={errors.school_class_id}
          placeholder="Select Class"
          options={schoolClasses.map((schoolClass) => ({
            value: schoolClass.id,
            label: schoolClass.name,
          }))}
          onChange={(e) =>
            handleChange(
              "school_class_id",
              Number(e.target.value)
            )
          }
        />

        <Select
          label="Section"
          required
          value={values.school_section_id}
          error={errors.school_section_id}
          placeholder="Select Section"
          disabled={!values.school_class_id}
          options={sections.map((section) => ({
            value: section.id,
            label: section.name,
          }))}
          onChange={(e) =>
            handleChange(
              "school_section_id",
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

    </div>
  );
}