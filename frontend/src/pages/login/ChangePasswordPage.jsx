import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Save
} from "lucide-react";

import { authApi } from "../../api/authApi";

export default function ChangePasswordPage() {  

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (newPassword !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;

    }

    try {

      setLoading(true);

      const response =
        await authApi.changePassword({
          new_password: newPassword
        });

      // 🔥 IMPORTANT FIX: clear frontend auth state
    localStorage.removeItem("user"); // if used
    localStorage.removeItem("token"); // if used

    // If using Zustand (likely in your app)
    // useAuthStore.getState().logout();

    navigate("/login"); // FORCE LOGIN AGAIN

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to change password."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="
          min-h-screen
          bg-gradient-to-br
          from-slate-50
          via-white
          to-blue-50
          flex
          items-center
          justify-center
          px-4
          ">

      <div className="w-full max-w-md">

        <div className="
            rounded-3xl
            border
            border-gray-200
            bg-white
            shadow-xl
            p-8
            ">

          {/* Header */}
          <div className="text-center">

            <div className="inline-flex items-center justify-center rounded-2xl bg-indigo-100 p-4">

              <ShieldCheck
                size={32}
                className="text-indigo-600"
              />

            </div>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Change Password
            </h1>

            <p className="mt-2 text-gray-500">
            For security reasons, you must create a new password before continuing.
          </p>

          </div>


          {/* Error */}
          {error && (

            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}


          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* New Password */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-xl border py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >

                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* Confirm Password */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm password"
                  className="w-full rounded-xl border py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >

                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >

              <Save size={18} />

              {loading
                ? "Changing Password..."
                : "Change Password"}

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}