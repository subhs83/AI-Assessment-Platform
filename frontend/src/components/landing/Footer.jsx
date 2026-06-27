import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Reveal from "../common/Reveal";

export default function Footer() {

  return (
    <footer className="bg-slate-950 text-gray-300">
      <Reveal delay={.1}>

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Company */}

          <div>

            <h3 className="text-2xl font-bold text-white">

              IndiaEduCore

            </h3>

            <p className="
            mt-5
            leading-relaxed
            text-gray-400">

              AI-Powered Assessment Platform for schools, teachers,
              and institutions. Generate questions with AI,
              conduct exams, and analyze performance from one
              intelligent platform.

            </p>

          </div>


          {/* Product */}

          <div>

            <h4 className="
            text-lg
            font-semibold
            text-white
            mb-6">

              Product

            </h4>

            <div className="space-y-4">

              <Link
                to="/features"
                className="block hover:text-white"
              >
                AI Features
              </Link>


              <Link
                to="/pricing"
                className="block hover:text-white"
              >
                Pricing
              </Link>

            </div>

          </div>


          {/* Company */}

          <div>

            <h4 className="
            text-lg
            font-semibold
            text-white
            mb-6">

              Company

            </h4>

            <div className="space-y-4">

              <Link
                to="/about"
                className="block hover:text-white"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="block hover:text-white"
              >
                Contact
              </Link>

              <Link
                to="/demo"
                className="block hover:text-white"
              >
                Book Demo
              </Link>

            </div>

          </div>


          {/* Contact */}

          <div>

            <h4 className="
            text-lg
            font-semibold
            text-white
            mb-6">

              Contact

            </h4>

            <div className="space-y-5">

              <div className="flex gap-3">

                <Mail
                  size={18}
                  className="mt-1 text-blue-400"
                />

                <span>
                  info@indiaeducore.com
                </span>

              </div>

              <div className="flex gap-3">

                <Phone
                  size={18}
                  className="mt-1 text-blue-400"
                />

                <span>
                  +91 XXXXX XXXXX
                </span>

              </div>

              <div className="flex gap-3">

                <MapPin
                  size={18}
                  className="mt-1 text-blue-400"
                />

                <span>
                  India
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* Bottom */}

        <div className="
        mt-16
        pt-8
        border-t
        border-slate-800
        flex
        flex-col
        md:flex-row
        items-center
        justify-between
        gap-4">

          <div className="text-gray-500">

            © 2026 IndiaEduCore. All rights reserved.

          </div>

          <div className="flex gap-8">

            <Link
              to="/privacy"
              className="hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="hover:text-white"
            >
              Terms of Service
            </Link>

          </div>

        </div>

      </div>
</Reveal>
    </footer>
  );

}