import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/client";
import BrandHeader from "../../components/student/BrandHeader"
import { useToast } from "../../components/ui/Toast";


const RegisterPage = () => {
  const { schoolSlug, quizCode } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    student_class: "",
    roll_number: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        `/api/student/${schoolSlug}/quiz/${quizCode}/start`,
        form,
        { withCredentials: true }
      );

      const data = res.data;

      if (!data) {
        showToast("Empty response from server", "error");
        return;
      }

      if (data.success === false) {
        showToast(data.message || "Request failed", "error");
        return;
      }

      if (data.status === "redirect_result") {
        const attemptId = data.attempt_id || data.data?.attempt_id;

        if (attemptId) {
          showToast("Redirecting to result...", "info");
          navigate(`/school/${schoolSlug}/result/${attemptId}`);
          return;
        }
      }

      const attemptId =
        data?.data?.attempt_id || data?.attempt_id;

      if (attemptId) {
        showToast("Starting exam...", "success");
        navigate(`/school/${schoolSlug}/attempt/${attemptId}/0`);
        return;
      }

      showToast("Invalid response from server", "error");

    } catch (err) {
      console.log(err);
      showToast(
        err?.response?.data?.message || "Server error",
        "error"
      );
    }
  };
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex flex-col">
      
      <BrandHeader schoolName="ABC School" />

      <main className="flex-1 flex items-center justify-center px-4 py-4">
        
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur sm:p-6">
          
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Student Registration
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter details to start your exam
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">

              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First Name"
                autoCapitalize="words"
                autoComplete="given-name"
                required
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />

              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                autoCapitalize="words"
                autoComplete="family-name"
                required
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />

            </div>

            {/* Class */}

            <input
              type="text"
              name="student_class"
              value={form.student_class}
              onChange={handleChange}
              placeholder="Class (e.g. 1 Rose, 10 A)"
              autoCapitalize="words"
              autoComplete="off"
              spellCheck={false}
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />

            {/* Roll Number */}

            <input
              type="text"
              name="roll_number"
              value={form.roll_number}
              onChange={handleChange}
              placeholder="Roll Number"
              autoComplete="off"
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />

            {/* Mobile */}

            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />

            {/* Button */}

            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98]"
            >
              Start Quiz →
            </button>

          </form>

        </div>

      </main>

    </div>
  );
};

export default RegisterPage;