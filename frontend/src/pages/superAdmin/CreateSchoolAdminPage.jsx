import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";

export default function CreateSchoolAdminPage() {

  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { createSchoolAdmin, loading } =
    useSuperAdminStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleChange = (e) => {

    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const data = await createSchoolAdmin(
        schoolId,
        formData
      );

      showToast(
        `Temporary Password: ${data.temp_password}`,
        "success"
      );

      navigate(
        `/super-admin/schools/${schoolId}/admins`
      );

    } catch (error) {

      showToast(
        error.response?.data?.error ||
        "Failed to create admin",
        "error"
      );

    }

  };

  return (

    <div className="max-w-2xl mx-auto">

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <h1 className="text-2xl font-bold mb-6">
          Add School Admin
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="block mb-1 font-medium">
              Name
            </label>

            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>

          <div>

            <label className="block mb-1 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>
          <div>

        <label className="block mb-1 font-medium">
            Phone Number
        </label>

        <input
            type="text"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
        />

        </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            {loading
              ? "Creating..."
              : "Create School Admin"}
          </button>

        </form>

      </div>

    </div>

  );
}