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

  const { students, fetchStudents, deleteStudent } = useTeacherStore();
  const downloadStudentTemplate = useTeacherStore(
    (s) => s.downloadStudentTemplate
  );
  const openCount = students.filter(s => s.student_registration_type === "OPEN").length;
  const verifiedCount = students.filter(s => s.student_registration_type === "VERIFIED").length;
  // =========================
  // 1. STATE
  // =========================
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");

  // =========================
  // 2. DATA FETCH
  // =========================
  useEffect(() => {
    fetchStudents(schoolSlug);
  }, [schoolSlug, fetchStudents]);

  // =========================
  // 3. DERIVED DATA
  // =========================
  console.log("Students :",students);
  const filteredStudents = students.filter((student) => {
    
  const value = search.toLowerCase();

  const matchesSearch =
    student.student_name.toLowerCase().includes(value) ||
    student.roll_number.toLowerCase().includes(value) ||
    student.student_class.toLowerCase().includes(value) ||
    (student.mobile || "").toLowerCase().includes(value);

  const matchesType =
    typeFilter === "ALL" ||
    student.student_registration_type === typeFilter;

  return matchesSearch && matchesType;
});

  // =========================
  // 4. ACTIONS
  // =========================
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadStudentTemplate(schoolSlug);
      downloadFile(blob, "Student_Import_Template.xlsx");
    } catch (err) {
      showToast("Failed to download template.", "error");
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

      showToast(response.message, "success");
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

  // =========================
  // 5. UI
  // =========================
  return (
    <div className="space-y-6">

      <PageHeader
        title="Students"
        description="Manage students for your school."
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

        {/* FILTER ROW */}
        <div className="flex gap-3 items-center">

          <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="ALL">All Students ({students.length})</option>
          <option value="OPEN">Open ({openCount})</option>
          <option value="VERIFIED">Verified ({verifiedCount})</option>
        </select>

        </div>

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
        refresh={() => fetchStudents(schoolSlug)}
      />

      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        schoolSlug={schoolSlug}
        refresh={() => fetchStudents(schoolSlug)}
      />

      <EditStudentModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        schoolSlug={schoolSlug}
        refresh={() => fetchStudents(schoolSlug)}
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