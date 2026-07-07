import { useEffect, useState } from "react";

import FormModal from "../../ui/FormModal";
import StudentForm from "./StudentForm";

import { useTeacherStore } from "../../../store/teacherStore";
import { useToast } from "../../ui/Toast";

const INITIAL_VALUES = {
  first_name: "",
  last_name: "",
  school_class_id: "",
  school_section_id: "",
  roll_number: "",
  mobile: "",
};

export default function EditStudentModal({
  open,
  onClose,
  schoolSlug,
  student,
  refresh,
}) {
  const { showToast } = useToast();

  const {
    updateStudent,
    schoolClasses,
    sections,
    fetchSchoolClasses,
    fetchSections,
  } = useTeacherStore();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !student) return;

    fetchSchoolClasses(schoolSlug);

    setValues({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      school_class_id: student.school_class_id || "",
      school_section_id: student.school_section_id || "",
      roll_number: student.roll_number || "",
      mobile: student.mobile || "",
    });

    setErrors({});
  }, [
    open,
    student,
    schoolSlug,
    fetchSchoolClasses,
  ]);

  useEffect(() => {
    if (!values.school_class_id) return;

    fetchSections(
      schoolSlug,
      values.school_class_id
    );
  }, [
    values.school_class_id,
    schoolSlug,
    fetchSections,
  ]);

  const validate = () => {
    const newErrors = {};

    if (!values.first_name.trim()) {
      newErrors.first_name =
        "First Name is required.";
    }

    if (!values.school_class_id) {
      newErrors.school_class_id =
        "Class is required.";
    }

    if (!values.school_section_id) {
      newErrors.school_section_id =
        "Section is required.";
    }

    if (!values.roll_number.trim()) {
      newErrors.roll_number =
        "Roll Number is required.";
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

  const handleValuesChange = (newValues) => {
    if (
      newValues.school_class_id !==
      values.school_class_id
    ) {
      newValues.school_section_id = "";
    }

    setValues(newValues);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await updateStudent(
        schoolSlug,
        student.student_uid,
        values
      );

      showToast(
        response.message,
        "success"
      );

      refresh();

      handleClose();

    } catch (err) {

      const apiErrors =
        err.response?.data?.errors;

      if (apiErrors) {
        setErrors(apiErrors);
      }

      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to update student.",
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
      title="Edit Student"
      description="Update student information."
      saveText="Update Student"
      loading={loading}
      onSave={handleSave}
      onClose={handleClose}
    >
      <StudentForm
        values={values}
        errors={errors}
        onChange={handleValuesChange}
        clearError={clearError}
        schoolClasses={schoolClasses}
        sections={sections}
      />
    </FormModal>
  );
}