import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";

export default function EditSchoolPage() {

  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    getSchoolById,
    updateSchool,
    loading
  } = useSuperAdminStore();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  const [logo, setLogo] = useState(null);

  useEffect(() => {

    const fetchSchool = async () => {

      try {

        const data = await getSchoolById(schoolId);

        setFormData({
          name: data.school.name || "",
          address: data.school.address || "",
          phone: data.school.phone || "",
          email: data.school.email || ""
        });

      } catch (error) {

        showToast(
          error.response?.data?.error ||
          "Failed to load school",
          "error"
        );

      }

    };

    fetchSchool();

  }, [schoolId, getSchoolById, showToast]);

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

      payload.append("name", formData.name);
      payload.append("address", formData.address);
      payload.append("phone", formData.phone);
      payload.append("email", formData.email);

      if (logo) {
        payload.append("logo", logo);
      }

      const response = await updateSchool(
        schoolId,
        payload
      );

      showToast(
        response.message || "School updated successfully",
        "success"
      );

      navigate("/super-admin/schools");

    } catch (error) {

      showToast(
        error.response?.data?.error ||
        "Failed to update school",
        "error"
      );

    }

  };

  return (
    <div className="max-w-3xl mx-auto">

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <h1 className="text-2xl font-bold mb-6">
          Edit School
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
              rows="3"
              name="address"
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
              Replace Logo (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              {loading ? "Updating..." : "Update School"}
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