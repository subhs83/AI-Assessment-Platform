import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send
} from "lucide-react";

import { homeApi } from "../../../api/homeApi";
import Reveal from "../../common/Reveal";
import { useToast } from "../../ui/Toast";

export default function ContactFormSection() {

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
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

      await homeApi.sendContactMessage(form);

      showToast("Message sent successfully.");

      setForm({
        name: "",
        phone: "",
        email: "",
        message: ""
      });

    } catch (error) {

      showToast(
        error.response?.data?.message ||
        "Failed to send message."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="py-10 bg-slate-50">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        <div className="
          grid
          lg:grid-cols-2
          gap-10
          items-start">

          {/* Left Side */}

          <div>

            <div className="
              inline-flex
              px-4
              py-2
              rounded-full
              bg-blue-100
              text-blue-700
              font-medium
              mb-6">

              Contact Information

            </div>

            <h2 className="
              text-4xl
              lg:text-5xl
              font-bold
              text-gray-900">

              Let's Start A Conversation

            </h2>

            <p className="
              mt-6
              text-lg
              text-gray-600
              leading-relaxed">

              Have questions about IndiaEduCore or want to schedule a
              personalized demo? We'd love to hear from you.

            </p>

            <div className="mt-10 space-y-6">

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

                  <Mail size={24} />

                </div>

                <div>

                  <h3 className="font-bold text-gray-900">
                    Email
                  </h3>

                  <p className="mt-1 text-gray-600">
                    info@indiaeducore.com
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

                  <Phone size={24} />

                </div>

                <div>

                  <h3 className="font-bold text-gray-900">
                    Phone
                  </h3>

                  <p className="mt-1 text-gray-600">
                    +91 XXXXX XXXXX
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

                  <MapPin size={24} />

                </div>

                <div>

                  <h3 className="font-bold text-gray-900">
                    Location
                  </h3>

                  <p className="mt-1 text-gray-600">
                    India
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Right Side */}

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

              Send Us A Message

            </h3>

            <p className="
              mt-3
              text-gray-600">

              We'll get back to you as soon as possible.

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
                className="
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500"
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500"
              />

              <textarea
                rows="6"
                name="message"
                placeholder="How can we help you?"
                value={form.message}
                onChange={handleChange}
                required
                className="
                  w-full
                  border
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500"
              />

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
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-50">

                <Send size={18} />

                {loading ? "Sending..." : "Send Message"}

              </button>

            </form>

          </div>

        </div>

      </div>
</Reveal>
    </section>

  );

}