import Input from "../../ui/Input";

export default function SectionForm({
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

    if (typeof clearError === "function") {
      clearError(field);
    }

  };

  return (

    <div className="space-y-4">

      <Input
        label="Section Name"
        required
        placeholder="e.g. A"
        value={values.name}
        error={errors.name}
        onChange={(e) =>
          handleChange("name", e.target.value)
        }
      />

      <Input
        label="Display Order"
        required
        type="number"
        placeholder="e.g. 1"
        value={values.display_order}
        error={errors.display_order}
        onChange={(e) =>
          handleChange("display_order", e.target.value)
        }
      />

    </div>

  );

}