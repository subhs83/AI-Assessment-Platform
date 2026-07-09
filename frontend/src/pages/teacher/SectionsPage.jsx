import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useTeacherStore } from "../../store/teacherStore";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ManagementToolbar from "../../components/ui/ManagementToolbar";
import ConfirmModal from "../../components/ui/ConfirmModal";

import SectionTable from "../../components/teacher/academic-structure/SectionTable";
import AddSectionModal from "../../components/teacher/academic-structure/AddSectionModal";
import EditSectionModal from "../../components/teacher/academic-structure/EditSectionModal";

import { useToast } from "../../components/ui/Toast";
import BackButton from "../../components/ui/BackButton";

export default function SectionsPage() {

  const { schoolSlug, classId } = useParams();

  const { showToast } = useToast();

  const {
    sections,
    fetchSections,
    deleteSection,
    schoolClasses
  } = useTeacherStore();

  const schoolClass = schoolClasses.find(
  (c) => c.id === Number(classId)
);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    fetchSections(
      schoolSlug,
      classId
    );
  }, [
    schoolSlug,
    classId,
    fetchSections,
  ]);

  const filteredSections = sections.filter(
    (section) =>
      section.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleEdit = (section) => {
    setSelectedSection(section);
    setShowEditModal(true);
  };

  const handleDelete = (section) => {
    setSelectedSection(section);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {

    if (!selectedSection) return;

    try {

      const response = await deleteSection(
        schoolSlug,
        classId,
        selectedSection.id
      );

      showToast(
        response.message,
        "success"
      );

      fetchSections(
        schoolSlug,
        classId
      );

      setShowDeleteModal(false);
      setSelectedSection(null);

    } catch (err) {

      showToast(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete section.",
        "error"
      );

    }

  };

  return (

    <div className="space-y-6">
      
      <PageHeader
        title={`Sections${schoolClass ? ` • Class ${schoolClass.name}` : ""}`}
        description="Manage sections for this class."
        actions ={<BackButton to={-1} label="Go Back" />}
      />
      <ManagementToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sections..."
        primaryButton={{
          text: "Add Section",
          onClick: () => setShowAddModal(true),
        }}
      />

      {sections.length === 0 ? (

        <EmptyState
          title="No sections found"
          description="Add your first section to get started."
        />

      ) : (

        <SectionTable
          sections={filteredSections}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      )}

      <AddSectionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        schoolSlug={schoolSlug}
        classId={classId}
        refresh={() =>
          fetchSections(
            schoolSlug,
            classId
          )
        }
      />

      <EditSectionModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSection(null);
        }}
        schoolSlug={schoolSlug}
        classId={classId}
        section={selectedSection}
        refresh={() =>
          fetchSections(
            schoolSlug,
            classId
          )
        }
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Section"
        description={
          selectedSection
            ? `Are you sure you want to delete "${selectedSection.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Section"
        variant="danger"
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSection(null);
        }}
        onConfirm={handleConfirmDelete}
      />

    </div>

  );

}