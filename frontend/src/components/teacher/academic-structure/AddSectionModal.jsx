import { useState } from "react";

import FormModal from "../../ui/FormModal";
import SectionForm from "./SectionForm";

import { useTeacherStore } from "../../../store/teacherStore";
import { useToast } from "../../ui/Toast";

const INITIAL_VALUES = {
  name: "",
  display_order: "",
};

export default function AddSectionModal({
  open,
  onClose,
  schoolSlug,
  classId,
  refresh,
}) {

  const { showToast } = useToast();

  const createSection = useTeacherStore(
    (s) => s.createSection
  );

  const [values, setValues] = useState(INITIAL_VALUES);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const validate = () => {

    const newErrors = {};

    if (!values.name.trim()) {
      newErrors.name = "Section name is required.";
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

      const response = await createSection(
        schoolSlug,
        classId,
        {
          ...values,
          display_order: Number(values.display_order),
        }
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
        "Failed to add section.",
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
      title="Add Section"
      description="Add a section to this class."
      saveText="Save Section"
      loading={loading}
      onSave={handleSave}
      onClose={handleClose}
    >

      <SectionForm
        values={values}
        errors={errors}
        onChange={setValues}
        clearError={clearError}
      />

    </FormModal>

  );

}