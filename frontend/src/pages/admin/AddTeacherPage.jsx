import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";
import { useToast } from "../../components/ui/Toast";

import {
  UserPlus,
  User,
  Mail,
  Lock,
  ArrowLeft,
  Save,
} from "lucide-react";

export default function AddTeacherPage() {

  const { schoolSlug } = useParams();

  const navigate = useNavigate();

  const { showToast } = useToast();

  const {
    createTeacher,
    createTeacherLoading
  } = useAdminStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await createTeacher(
        schoolSlug,
        formData
      );

      showToast(
        response.message,
        "success"
      );

      navigate(
        `/school/${schoolSlug}/admin/teachers`
      );

    } catch (error) {

      showToast(
        error.response?.data?.message ||
        "Failed to add teacher",
        "error"
      );

    }

  };

  return (

  <div className="mx-auto max-w-3xl space-y-6">

    {/* Header */}
    <div className="flex items-center gap-4">

      <div className="rounded-2xl bg-indigo-100 p-3">

        <UserPlus
          size={24}
          className="text-indigo-600"
        />

      </div>

      <div>

        <h1 className="text-3xl font-bold text-gray-900">
          Add Teacher
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new teacher account for your school.
        </p>

      </div>

    </div>


    {/* Form Card */}
    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Name */}
        <div>

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">

            <User
              size={16}
              className="text-indigo-500"
            />

            Teacher Name

          </label>

          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter teacher name"
            className="w-full rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>


        {/* Email */}
        <div>

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">

            <Mail
              size={16}
              className="text-blue-500"
            />

            Email Address

          </label>

          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="teacher@example.com"
            className="w-full rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>


        {/* Password */}
        <div>

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">

            <Lock
              size={16}
              className="text-amber-500"
            />

            Initial Password

          </label>

          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">

            Teacher will be required to change the password after the first login.

          </div>

        </div>


        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/school/${schoolSlug}/admin/teachers`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-medium transition hover:bg-gray-50"
          >

            <ArrowLeft size={18} />

            Cancel

          </button>


          <button
            type="submit"
            disabled={createTeacherLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >

            <Save size={18} />

            {createTeacherLoading
              ? "Creating..."
              : "Add Teacher"}

          </button>

        </div>

      </form>

    </div>

  </div>

);

}