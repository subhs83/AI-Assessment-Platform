import { useState } from "react";

import FormModal from "../../ui/FormModal";
import StudentForm from "./StudentForm";

import { useTeacherStore } from "../../../store/teacherStore";
import { useToast } from "../../ui/Toast";

const INITIAL_VALUES = {
  first_name: "",
  last_name: "",
  student_class: "",
  roll_number: "",
  mobile: "",
};

export default function AddStudentModal({
  open,
  onClose,
  schoolSlug,
  refresh,
}) {

  const { showToast } = useToast();

  const createStudent = useTeacherStore( (s) => s.createStudent);

  const [values, setValues] = useState(INITIAL_VALUES);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const validate = () => {

    const newErrors = {};

    if (!values.first_name.trim()) {
      newErrors.first_name = "First Name is required.";
    }

    if (!values.student_class.trim()) {
      newErrors.student_class = "Class is required.";
    }

    if (!values.roll_number.trim()) {
      newErrors.roll_number = "Roll Number is required.";
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
        const isValid = validate();
        if (!isValid) {
            console.log("BLOCKED BY VALIDATION");
        return;
        }

    try {

      setLoading(true);

      const response = await createStudent(
        schoolSlug,
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
    setErrors(apiErrors);   // 👈 INLINE ERRORS
  }

  showToast(
    err.response?.data?.message ||
    err.message ||
    "Failed to add student.",
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
      title="Add Student"
      description="Add a verified student to your school."
      saveText="Save Student"
      loading={loading}
      onSave={handleSave}
      onClose={handleClose}
    >

      <StudentForm
        values={values}
        errors={errors}
        onChange={setValues}
        clearError={clearError}
      />

    </FormModal>

  );

}