import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";

export default function CreateSchoolPage() {

  const location = useLocation();

  const demo = location.state?.demo;


  const navigate = useNavigate();
  const { showToast } = useToast();

  const { createSchool, loading } = useSuperAdminStore();

  const [formData, setFormData] = useState({
    name: demo?.school_name || "",
    address: "",
    phone: demo?.phone || "",
    email: demo?.email || "",
    duration_days: ""
  });

  const [logo, setLogo] = useState(null);

  const handleChange = (e) => {

    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const payload = new FormData();
      if (demo) {
      payload.append( "demo_id",  demo.id);
      }

      payload.append("name", formData.name);
      payload.append("address", formData.address);
      payload.append("phone", formData.phone);
      payload.append("email", formData.email);
      payload.append("duration_days", formData.duration_days);

      if (logo) {
        payload.append("logo", logo);
      }

      const response = await createSchool(payload);

      showToast(
        response.message || "School created successfully",
        "success"
      );

      navigate("/super-admin/schools");

    } catch (error) {

      showToast(
        error.response?.data?.error ||
        "Failed to create school",
        "error"
      );

    }

  };

  return (
    <div className="max-w-3xl mx-auto">

      <div className="bg-white border rounded-xl p-6 shadow-sm">

        <h1 className="text-2xl font-bold mb-6">
          Add School
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block mb-1 font-medium">
              School Name
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
              Address
            </label>

            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
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
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Duration (Days)
            </label>

            <input
              type="number"
              min="1"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              School Logo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full"
            />
          </div>

          <div className="pt-4 flex gap-3">

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Create School"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/super-admin/schools")}
              className="border px-5 py-2 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}