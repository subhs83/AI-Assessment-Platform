import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/client";
import BrandHeader from "../../components/student/BrandHeader"
import { useToast } from "../../components/ui/Toast";
import SchoolLoading from "../../components/loading/SchoolLoading"

const initialInput =
  {
      first_name: "",
      last_name: "",
      school_class_id: "",
      school_section_id: "",
      roll_number: "",
      mobile: "",
    }
const RegisterPage = () => {
  const { schoolSlug, quizCode } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialInput);

  const [schoolClasses, setSchoolClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [startingExam, setStartingExam] = useState(false);


  useEffect(() => {

  const loadAcademicStructure = async () => {
    try {
        const res = await API.get(
            `/api/student/${schoolSlug}/academic-structure`
        );

        setSchool(res.data.data.school);
        setSchoolClasses(res.data.data.classes);

    } catch (err) {
        console.error(err);

        showToast(
            "Failed to load classes.",
            "error"
        );

    } finally {
        setLoading(false);
    }
};

  loadAcademicStructure();

}, [schoolSlug, showToast]);


  const handleChange = (e) => {

  const { name, value } = e.target;

  if (name === "school_class_id") {

    const selectedClass = schoolClasses.find(
      (c) => String(c.id) === value
    );

    setSections(
      selectedClass?.sections || []
    );

    setForm((prev) => ({
      ...prev,
      school_class_id: value,
      school_section_id: "",
    }));

    return;
  }

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));

};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStartingExam(true);

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
    finally {
      setStartingExam(false);
  }
  };

  if (loading) {
      return (
          <SchoolLoading
              name={school?.name}
              logo={school?.logo}
              message="Preparing your exam..."
          />
      );
  }

  if (startingExam) {
      return (
          <SchoolLoading
              name={school?.name}
              logo={school?.logo}
              message="Starting your exam..."
          />
      );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex flex-col">
      
      <BrandHeader
          schoolName={school.name}
          schoolLogo={school.logo}
      />

      <main className="flex-1 px-4 py-6 sm:flex sm:items-center sm:justify-center pb-safe">
        
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-slate-50 border-slate-200 p-6 shadow-xl backdrop-blur sm:p-6">
          
          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Student Registration
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter details to start your exam
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

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

            <select
              name="school_class_id"
              value={form.school_class_id}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">
                Select Class
              </option>

              {schoolClasses.map((schoolClass) => (
                <option
                  key={schoolClass.id}
                  value={schoolClass.id}
                >
                  {schoolClass.name}
                </option>
              ))}
            </select>
            <select
                name="school_section_id"
                value={form.school_section_id}
                onChange={handleChange}
                disabled={!form.school_class_id || sections.length === 0}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              >
                <option value="">
                  {sections.length
                    ? "Select Section"
                    : "No Sections"}
                </option>

                {sections.map((section) => (
                  <option
                    key={section.id}
                    value={section.id}
                  >
                    {section.name}
                  </option>
                ))}
              </select>

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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              autoComplete="tel"
              maxLength={10}
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />

            {/* Button */}

            <button
              type="submit"
              className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98]"
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