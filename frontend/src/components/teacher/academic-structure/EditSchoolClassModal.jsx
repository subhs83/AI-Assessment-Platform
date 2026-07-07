import { useEffect, useState } from "react";

import FormModal from "../../ui/FormModal";
import SchoolClassForm from "./SchoolClassForm";

import { useTeacherStore } from "../../../store/teacherStore";
import { useToast } from "../../ui/Toast";

const INITIAL_VALUES = {
  name: "",
  display_order: "",
};

export default function EditSchoolClassModal({
  open,
  onClose,
  schoolSlug,
  schoolClass,
  refresh,
}) {

  const { showToast } = useToast();

  const updateSchoolClass = useTeacherStore(
    (s) => s.updateSchoolClass
  );

  const [values, setValues] = useState(INITIAL_VALUES);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (schoolClass && open) {

      setValues({
        name: schoolClass.name || "",
        display_order: schoolClass.display_order ?? "",
      });

      setErrors({});

    }

  }, [schoolClass, open]);

  const validate = () => {

    const newErrors = {};

    if (!values.name.trim()) {
      newErrors.name = "Class name is required.";
    }

    if (values.display_order === "") {
      newErrors.display_order = "Display order is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  const resetForm = () => {

    setValues(INITIAL_VALUES);

    setErrors({});

  };

  const handleClose = () => {

    if (loading) return;

    resetForm();

    onClose();

  };

  const handleSave = async () => {

    if (!validate()) {
      return;
    }

    try {

      setLoading(true);

      const response = await updateSchoolClass(
        schoolSlug,
        schoolClass.id,
        values
      );

      showToast(
        response.message,
        "success"
      );

      refresh();

      handleClose();

    } catch (err) {

      const apiErrors = err.response?.data?.errors;

      if (apiErrors) {
        setErrors(apiErrors);
      }

      showToast(
        err.response?.data?.message ||
        err.message ||
        "Failed to update class.",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };

  const clearError = (field) => {

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

  };

  return (

    <FormModal
      open={open}
      title="Edit Class"
      description="Update class information."
      saveText="Update Class"
      loading={loading}
      onSave={handleSave}
      onClose={handleClose}
    >

      <SchoolClassForm
        values={values}
        errors={errors}
        onChange={setValues}
        clearError={clearError}
      />

    </FormModal>

  );

}