import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader"
import { useToast } from "../../components/ui/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";
import TeacherTable from "../../components/admin/teachers/TeacherTable";
import TeacherMobileCard from "../../components/admin/teachers/TeacherMobileCard";


import {
  Users,
  UserPlus,
} from "lucide-react";

export default function ViewTeachersPage() {
  const [teacherToToggle, setTeacherToToggle] =  useState(null);

  const [teacherToReset, setTeacherToReset] =  useState(null);

  const { schoolSlug } = useParams();

  const { showToast } = useToast();

  const {
    teachers,
    teachersLoading,
    teachersError,
    fetchTeachers,
    toggleTeacher,
    resetTeacherPassword,
  } = useAdminStore();

  useEffect(() => {

    fetchTeachers(
      schoolSlug
    );

  }, [schoolSlug, fetchTeachers]);


  const handleToggle = async () => {

  if (!teacherToToggle) return;

  try {

    await toggleTeacher(
      schoolSlug,
      teacherToToggle.id
    );

    showToast(
      "Teacher status updated",
      "success"
    );

    setTeacherToToggle(null);

  } catch (error) {

    showToast(
      error.response?.data?.message ||
      "Failed to update teacher",
      "error"
    );

  }

};


  const handleResetPassword = async () => {

  if (!teacherToReset) return;

  try {

    const response =
      await resetTeacherPassword(
        schoolSlug,
        teacherToReset.id
      );

    showToast(
      `Temporary password: ${response.temp_password}`,
      "success"
    );

    setTeacherToReset(null);

  } catch (error) {

    showToast(
      error.response?.data?.message ||
      "Failed to reset password",
      "error"
    );

  }

};


  if (teachersLoading) {

    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );

  }

  if (teachersError) {

    return (
      <ErrorState
        title="Failed to load teachers"
        message={teachersError}
      />
    );

  }

  if (!teachers.length) {

    return (
      <EmptyState
        title="No teachers found"
        message="Add your first teacher to get started."
      />
    );

  }

  return (

    <>
  <div className="space-y-6">

    {/* Header */}
    <div className="hidden md:block">
     <PageHeader
        title="Teachers"
        description="Manage teachers in your school and control account access."
        icon={Users}
        iconColor="text-indigo-600"
        iconBackground="bg-indigo-100"
        actions={
          <Link
            to={`/school/${schoolSlug}/admin/teachers/add`}
            className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <UserPlus size={18} />
            Add Teacher
          </Link>
        }
      />
    </div>
   <div className="md:hidden">
     <PageHeader
        title="Teachers"
        description="Manage teachers in your school and control account access."
        icon={Users}
        iconColor="text-indigo-600"
        iconBackground="bg-indigo-100"
      />
      <Link
        to={`/school/${schoolSlug}/admin/teachers/add`}
        className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        <UserPlus size={18} />
        Add Teacher
      </Link>
    </div>


    {/* Table */}
    {/* Mobile */}
    <div className="md:hidden">
      <TeacherMobileCard
        teachers={teachers}
        onToggle={setTeacherToToggle}
        onReset={setTeacherToReset}
      />
    </div>

    {/* Desktop */}
    <div className="hidden md:block">
      <TeacherTable
        teachers={teachers}
        onToggle={setTeacherToToggle}
        onReset={setTeacherToReset}
      />
    </div>

  </div>
  <ConfirmModal
    open={!!teacherToToggle}
    title={
      teacherToToggle?.is_active
        ? "Deactivate Teacher"
        : "Activate Teacher"
    }
    description={
      teacherToToggle?.is_active
        ? `Are you sure you want to deactivate ${teacherToToggle?.name}?`
        : `Are you sure you want to activate ${teacherToToggle?.name}?`
    }
    confirmText={
      teacherToToggle?.is_active
        ? "Deactivate"
        : "Activate"
    }
    variant={
      teacherToToggle?.is_active
        ? "danger"
        : "success"
    }
    onClose={() =>
      setTeacherToToggle(null)
    }
    onConfirm={handleToggle}
  />

  <ConfirmModal
    open={!!teacherToReset}
    title="Reset Password"
    description={
      teacherToReset
        ? `A new temporary password will be generated for ${teacherToReset.name}. The teacher will be required to change it on next login.`
        : ""
    }
    confirmText="Reset Password"
    variant="primary"
    onClose={() =>
      setTeacherToReset(null)
    }
    onConfirm={handleResetPassword}
  />
  </>

);
}