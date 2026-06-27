import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LockKeyhole,
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

  }, [schoolSlug]);


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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-indigo-100 p-3">

          <Users
            size={24}
            className="text-indigo-600"
          />

        </div>

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Teachers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage teachers in your school and control account access.
          </p>

        </div>

      </div>

      <Link
        to={`/school/${schoolSlug}/admin/teachers/add`}
        className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >

        <UserPlus size={18} />

        Add Teacher

      </Link>

    </div>


    {/* Table */}
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b bg-gray-50">

            <tr className="text-left text-sm font-semibold text-gray-700">

              <th className="px-6 py-4">
                Teacher
              </th>

              <th className="px-6 py-4">
                Email
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Password Change
              </th>

              <th className="px-6 py-4">
                Actions
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-gray-100">

            {teachers.map((teacher) => (

              <tr
                key={teacher.id}
                className="hover:bg-gray-50 transition"
              >

                <td className="px-6 py-4">

                  <div>
                    <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2">

                      <Users
                        size={16}
                        className="text-indigo-600"
                      />

                    </div>

                    <div className="font-semibold text-gray-900 whitespace-nowrap">
                      {teacher.name}
                    </div>

                  </div>

                  </div>
                </td>

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">

                    <Mail
                      size={16}
                      className="text-blue-500"
                    />

                    {teacher.email}

                  </div>

                </td>


                <td className="px-6 py-4">

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      teacher.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {teacher.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </td>


                <td className="px-6 py-4">

                  {teacher.force_password_change ? (

                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                      Required
                    </span>

                  ) : (

                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      Completed
                    </span>

                  )}

                </td>


                <td className="px-6 py-4">

                  <div className="flex items-center gap-2 whitespace-nowrap">

                    <button
                      onClick={() =>  setTeacherToToggle(teacher)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition ${
                        teacher.is_active
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >

                      {teacher.is_active ? (
                        <ShieldAlert size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}

                      {teacher.is_active ? "Deactivate" : "Activate"}

                    </button>


                    <button
                      onClick={() =>  setTeacherToReset(teacher)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
                      
                    >

                      <LockKeyhole size={18} />

                      Reset

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

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