import { useState } from "react";
import {
  CalendarCheck,
  Clock3,
  Sparkles,
  Users,
  CheckCircle
} from "lucide-react";

import { homeApi } from "../../../api/homeApi";
import Reveal from "../../common/Reveal";
import { useToast } from "../../ui/Toast";

export default function DemoFormSection() {

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    school_name: "",
    size: ""
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await homeApi.requestDemo(form);

      showToast("Demo request submitted successfully.");

      setForm({
        name: "",
        phone: "",
        email: "",
        school_name: "",
        size: ""
      });

    } catch (error) {

      showToast(
        error.response?.data?.message ||
        "Failed to submit request."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="py-12 bg-slate-50">
      <Reveal>
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Left Side */}

          <div>

            <div className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-blue-100
              text-blue-700
              font-medium
              mb-6">

              <CalendarCheck size={18} />

              Personalized Demo

            </div>

            <h2 className="
              text-4xl
              lg:text-5xl
              font-bold
              text-gray-900">

              Discover How IndiaEduCore Can Transform Assessments

            </h2>

            <p className="
              mt-6
              text-lg
              text-gray-600
              leading-relaxed">

              See AI-powered question generation, smart exams,
              analytics, and reports in action with a personalized demo.

            </p>

            <div className="mt-10 space-y-8">

              <div className="flex gap-4">

                <div className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-blue-100
                  text-blue-600
                  flex
                  items-center
                  justify-center">

                  <Clock3 size={24} />

                </div>

                <div>

                  <h3 className="font-bold text-gray-900">
                    Quick Session
                  </h3>

                  <p className="mt-1 text-gray-600">
                    Get a guided walkthrough tailored to your needs.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <div className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-blue-100
                  text-blue-600
                  flex
                  items-center
                  justify-center">

                  <Sparkles size={24} />

                </div>

                <div>

                  <h3 className="font-bold text-gray-900">
                    AI In Action
                  </h3>

                  <p className="mt-1 text-gray-600">
                    Experience question generation and analytics live.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <div className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-blue-100
                  text-blue-600
                  flex
                  items-center
                  justify-center">

                  <Users size={24} />

                </div>

                <div>

                  <h3 className="font-bold text-gray-900">
                    Built For Institutions
                  </h3>

                  <p className="mt-1 text-gray-600">
                    Suitable for schools, coaching centers and organizations.
                  </p>

                </div>

              </div>

            </div>

            <div className="
              mt-10
              flex
              flex-wrap
              gap-6
              text-sm
              text-gray-500">

              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Free Demo
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                No Commitment
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Personalized Guidance
              </div>

            </div>

          </div>

          {/* Form */}

          <div className="
            bg-white
            border
            rounded-3xl
            p-8
            shadow-sm">

            <h3 className="
              text-3xl
              font-bold
              text-gray-900">

              Schedule Your Demo

            </h3>

            <p className="
              mt-3
              text-gray-600">

              Fill out the form and we'll contact you shortly.

            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5">

              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="text"
                name="school_name"
                placeholder="School / Institution"
                value={form.school_name}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Institution Size</option>
                <option value="1-500">1 - 500 Students</option>
                <option value="500-1000">500 - 1000 Students</option>
                <option value="1000-3000">1000 - 3000 Students</option>
                <option value="3000+">3000+ Students</option>
              </select>

              <button
                disabled={loading}
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-4
                  rounded-xl
                  font-semibold
                  disabled:opacity-50">

                {loading ? "Submitting..." : "Book Free Demo"}

              </button>

            </form>

          </div>

        </div>

      </div>
</Reveal>

    </section>

  );

}