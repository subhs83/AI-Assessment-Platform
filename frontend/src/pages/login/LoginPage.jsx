import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
 
import logo from "../../assets/logo.png";

import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {

  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);
  const authLoading = useAuthStore((s) => s.authLoading);
  const authError = useAuthStore((s) => s.authError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await login({
        email,
        password
      });

      navigate(
        response.redirect_path
      );

    } catch (error) {
      // handled by authStore
    }

  };

  return (

    <div
        className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-white
        to-blue-50
        flex
        items-center
        justify-center
        px-4
        py-5"
      >

      <div className="w-full max-w-md">

        {/* Card */}
        <div
          className="
          rounded-3xl
          border
          border-gray-200
          bg-white/90
          backdrop-blur-sm
          shadow-xl
          p-4"
        >

          {/* Header */}
          <div className="text-center">

            <Link
              to="/"
              className="flex flex-col items-center"
            >
              <img
                src={logo}
                alt="IndiaEduCore"
                className="h-20 w-auto"
              />

              <div className="mt-2">
                <div className="font-bold text-2xl text-blue-700">
                  IndiaEduCore
                </div>

                <div className="text-sm text-gray-500">
                  AI Assessment Platform
                </div>
              </div>
            </Link>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Access your dashboard and assessment tools.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* Email */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

            </div>


            {/* Password */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-xl border py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* Error */}
            {authError && (

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                {authError}

              </div>

            )}


            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >

              <LogIn size={18} />

              {authLoading
                ? "Signing In..."
                : "Login"}

            </button>

          </form>


          {/* Footer */}
          <div className="mt-6 border-t pt-4">

            <p className="text-center text-sm text-gray-500 leading-6">

              Forgot your password?
              <br />

              Please contact your School Administrator
              or system support.

            </p>

            <div className="mt-5 text-center">

              <Link
                to="/"
                className="
                text-sm
                text-blue-600
                hover:text-blue-700
                font-medium
                transition"
              >
                ← Back to Website
              </Link>

            </div>

          </div>
        </div>

      </div>

    </div>

  );

}