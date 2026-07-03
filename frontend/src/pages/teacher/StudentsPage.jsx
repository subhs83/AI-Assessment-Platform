import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useTeacherStore } from "../../store/teacherStore";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import StudentTable from "../../components/teacher/students/StudentTable";
import ImportStudentsModal from "../../components/teacher/students/ImportStudentsModal";
import AddStudentModal from "../../components/teacher/students/AddStudentModal";
import EditStudentModal from "../../components/teacher/students/EditStudentModal";
import ManagementToolbar from "../../components/ui/ManagementToolbar";
import ConfirmModal from "../../components/ui/ConfirmModal";

import { downloadFile } from "../../utils/downloadFile";
import { useToast } from "../../components/ui/Toast";

export default function StudentsPage() {

  const { schoolSlug } = useParams();
  const { showToast } = useToast();

  const {
    students,
    fetchStudents,
    deleteStudent,
  } = useTeacherStore();

  const [search, setSearch] = useState("");

  const [showImportModal, setShowImportModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const downloadStudentTemplate = useTeacherStore(
    (s) => s.downloadStudentTemplate
  );

  useEffect(() => {
    fetchStudents(schoolSlug);
  }, [schoolSlug, fetchStudents]);

  const filteredStudents = students.filter((student) => {

    const value = search.toLowerCase();

    return (
      student.student_name.toLowerCase().includes(value) ||
      student.roll_number.toLowerCase().includes(value) ||
      student.student_class.toLowerCase().includes(value) ||
      (student.mobile || "").toLowerCase().includes(value)
    );

  });

  const handleDownloadTemplate = async () => {

    try {

      const blob =
        await downloadStudentTemplate(
          schoolSlug
        );

      downloadFile(
        blob,
        "Student_Import_Template.xlsx"
      );

    } catch (err) {

      showToast(
        "Failed to download template.",
        "error"
      );

    }

  };

  const handleEdit = (student) => {

    setSelectedStudent(student);

    setShowEditModal(true);

  };

  const handleDelete = (student) => {

  setSelectedStudent(student);

  setShowDeleteModal(true);

};

const handleConfirmDelete = async () => {

  if (!selectedStudent) return;

  try {

    const response = await deleteStudent(
      schoolSlug,
      selectedStudent.student_uid
    );

    showToast(
      response.message,
      "success"
    );

    fetchStudents(schoolSlug);

    setShowDeleteModal(false);

    setSelectedStudent(null);

  } catch (err) {

    showToast(
      err.response?.data?.message ||
      err.message ||
      "Failed to delete student.",
      "error"
    );

  }

};

  return (

    <div className="space-y-6">

      <PageHeader
        title="Students"
        description="Manage verified students for your school."
      />

      <ManagementToolbar
        search={search}
        onSearchChange={setSearch}
        primaryButton={{
          text: "Add Student",
          onClick: () => setShowAddModal(true),
        }}
        secondaryButtons={[
          {
            text: "Download Template",
            onClick: handleDownloadTemplate,
          },
          {
            text: "Import Students",
            onClick: () => setShowImportModal(true),
          },
        ]}
      />

      {students.length === 0 ? (

        <EmptyState
          title="No students found"
          description="Add your first student to get started."
        />

      ) : (

        <StudentTable
          students={filteredStudents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      )}

      <ImportStudentsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        schoolSlug={schoolSlug}
        refresh={() =>
          fetchStudents(schoolSlug)
        }
      />

      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        schoolSlug={schoolSlug}
        refresh={() =>
          fetchStudents(schoolSlug)
        }
      />

      <EditStudentModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        schoolSlug={schoolSlug}
        refresh={() =>
          fetchStudents(schoolSlug)
        }
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Student"
        description={
          selectedStudent
            ? `Are you sure you want to delete "${selectedStudent.student_name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Student"
        variant="danger"
        onClose={() => {

          setShowDeleteModal(false);

          setSelectedStudent(null);

        }}
        onConfirm={handleConfirmDelete}
      />

    </div>

  );

}