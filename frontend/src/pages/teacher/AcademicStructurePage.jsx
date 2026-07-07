import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useTeacherStore } from "../../store/teacherStore";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ManagementToolbar from "../../components/ui/ManagementToolbar";
import ConfirmModal from "../../components/ui/ConfirmModal";

import SchoolClassTable from "../../components/teacher/academic-structure/SchoolClassTable";
import AddSchoolClassModal from "../../components/teacher/academic-structure/AddSchoolClassModal";
import EditSchoolClassModal from "../../components/teacher/academic-structure/EditSchoolClassModal";

import { useToast } from "../../components/ui/Toast";

export default function AcademicStructurePage() {
  const { schoolSlug } = useParams();
  const { showToast } = useToast();

  const {
    schoolClasses,
    fetchSchoolClasses,
    deleteSchoolClass,
  } = useTeacherStore();

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchSchoolClasses(schoolSlug);
  }, [schoolSlug, fetchSchoolClasses]);

  const filteredClasses = schoolClasses.filter((schoolClass) =>
    schoolClass.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (schoolClass) => {
    setSelectedClass(schoolClass);
    setShowEditModal(true);
  };

  const handleDelete = (schoolClass) => {
    setSelectedClass(schoolClass);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;

    try {
      const response = await deleteSchoolClass(
        schoolSlug,
        selectedClass.id
      );

      showToast(response.message, "success");

      fetchSchoolClasses(schoolSlug);

      setShowDeleteModal(false);
      setSelectedClass(null);

    } catch (err) {

      showToast(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete class.",
        "error"
      );

    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Academic Structure"
        description="Manage classes and sections for your school."
      />

      <ManagementToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search classes..."
        primaryButton={{
          text: "Add Class",
          onClick: () => setShowAddModal(true),
        }}
      />

      {schoolClasses.length === 0 ? (
        <EmptyState
          title="No classes found"
          description="Add your first class to get started."
        />
      ) : (
        <SchoolClassTable
          schoolClasses={filteredClasses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <AddSchoolClassModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        schoolSlug={schoolSlug}
        refresh={() => fetchSchoolClasses(schoolSlug)}
      />

      <EditSchoolClassModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
        }}
        schoolClass={selectedClass}
        schoolSlug={schoolSlug}
        refresh={() => fetchSchoolClasses(schoolSlug)}
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Class"
        description={
          selectedClass
            ? `Are you sure you want to delete "${selectedClass.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Class"
        variant="danger"
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClass(null);
        }}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}