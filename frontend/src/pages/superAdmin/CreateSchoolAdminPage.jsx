
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";

export default function CreateSchoolAdminPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { createSchoolAdmin, loading } = useSuperAdminStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [createdAdmin, setCreatedAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await createSchoolAdmin(schoolId, formData);

      if (!data?.temp_password) {
        throw new Error("Temporary password was not returned by the server.");
      }

      // Keep credentials visible until the Super Admin closes the dialog.
      setCreatedAdmin({
        name: formData.name,
        email: formData.email,
        tempPassword: data.temp_password
      });

    } catch (error) {
      showToast(
        error.response?.data?.error ||
        error.message ||
        "Failed to create admin",
        "error"
      );
    }
  };

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(type);
      showToast(
        type === "all"
          ? "Login credentials copied successfully"
          : "Password copied successfully",
        "success"
      );

    } catch (error) {
      showToast(
        "Unable to copy. Please select and copy manually.",
        "error"
      );
    }
  };

  const handleDone = () => {
    setCreatedAdmin(null);
    setShowPassword(false);
    setCopied("");

    navigate(`/super-admin/schools/${schoolId}/admins`);
  };

  return (
    <div className="max-w-2xl mx-auto">

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <h1 className="text-2xl font-bold mb-6">
          Add School Admin
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

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
              type="tel"
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
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create School Admin"}
          </button>

        </form>
      </div>

      {/* Temporary Credentials Dialog */}
      {createdAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-created-title"
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6"
          >

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
                ✓
              </div>

              <div>
                <h2
                  id="admin-created-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Admin Created Successfully!
                </h2>

                <p className="text-sm text-gray-500">
                  School Admin account is ready.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
              <p className="text-sm text-blue-800">
                Please copy and securely share these login credentials
                with the School Admin. This temporary password will
                no longer be available after you close this window.
              </p>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School Admin Email
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdAdmin.email}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-800"
                />

                <button
                  type="button"
                  onClick={() => copyText(createdAdmin.email, "email")}
                  className="shrink-0 border rounded-lg px-3 py-2 hover:bg-gray-100"
                  title="Copy email"
                >
                  {copied === "email" ? "✓" : "Copy"}
                </button>
              </div>
            </div>

            {/* Temporary Password */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temporary Password
              </label>

              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  readOnly
                  value={createdAdmin.tempPassword}
                  className="w-full min-w-0 border rounded-lg px-3 py-2 bg-gray-50 text-gray-800"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="shrink-0 border rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => copyText(createdAdmin.tempPassword, "password")}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg"
              >
                {copied === "password"
                  ? "✓ Password Copied"
                  : "Copy Temporary Password"}
              </button>
            </div>

            {/* Copy All Credentials */}
            <button
              type="button"
              onClick={() =>
                copyText(
                  `School Admin Login\nEmail: ${createdAdmin.email}\nTemporary Password: ${createdAdmin.tempPassword}`,
                  "all"
                )
              }
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2.5 rounded-lg mb-3"
            >
              {copied === "all"
                ? "✓ Credentials Copied"
                : "Copy All Login Credentials"}
            </button>

            <button
              type="button"
              onClick={handleDone}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg"
            >
              Done
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
