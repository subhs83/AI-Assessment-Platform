import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import logo from "../../assets/logo.png";
import { motion  } from "framer-motion";




export default function Navbar() {
const [scrolled, setScrolled] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);
const [hovered, setHovered] = useState(null);

const links = [
  { name: "Home", to: "/" },
  { name: "Features", to: "/features" },
  { name: "Pricing", to: "/pricing" },
  { name: "About", to: "/about" },
  { name: "Contact", to: "/contact" }
];

useEffect(() => {
const handleScroll = () => {
setScrolled(window.scrollY > 20);
};

window.addEventListener("scroll", handleScroll);

return () =>
  window.removeEventListener("scroll", handleScroll);

}, []);

const navLinkClass = ({ isActive }) =>
`font-medium transition-colors ${
      isActive
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
    }`;

return (
<>
<header
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            scrolled
              ? "bg-white/90 backdrop-blur-md border-b shadow-sm"
              : "bg-white/70 backdrop-blur-sm"
          }
        `}
> <div className="max-w-7xl mx-auto px-6"> <div className="h-20 flex items-center justify-between">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src={logo}
            alt="IndiaEduCore"
            className="h-20 w-auto object-contain"
          />

          {/* Uncomment if desired */}

          <div>
            <div className="font-bold text-xl text-blue-700">
              IndiaEduCore
            </div>

            <div className="text-xs text-gray-500">
              AI Assessment Platform
            </div>
          </div>

         
        </Link>

        {/* Desktop Navigation */}

        <nav
          className="hidden lg:flex items-center gap-2"
          onMouseLeave={() => setHovered(null)}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onMouseEnter={() => setHovered(link.name)}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-full font-medium transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : hovered === link.name
                    ? "text-gray-700"
                    : "text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {(hovered === link.name || isActive) && (
                    <motion.div
                        layoutId="navbar-pill"
                        className="
                          absolute
                          inset-0
                          rounded-full
                          bg-blue-50
                          border-2
                          border-blue-700
                        "
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                  )}

                  <span className="relative z-10">
                    {link.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}

        <div className="hidden lg:flex items-center gap-3">

          <Link
              to="/login"
              className="
                  px-5
                  py-2.5
                  rounded-xl
                  bg-gradient-to-r
                  from-slate-100
                  to-blue-50
                  text-gray-700
                  font-medium
                  border
                  border-gray-200
                  hover:shadow-md
                  transition-all
                  duration-300
                  "
            >
              Login
            </Link>

          <Link
            to="/demo"
            className="
              px-5 py-2.5
              rounded-xl
              bg-blue-600
              text-white
              hover:bg-blue-700
              font-medium
              shadow-sm
              transition
            "
          >
            Book Free Demo
          </Link>
        </div>

        {/* Mobile Menu Button */}

        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden"
        >
          <Menu size={28} />
        </button>

      </div>
    </div>
  </header>

  {/* Mobile Drawer */}

  {mobileOpen && (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={() => setMobileOpen(false)}
      />

      <div
        className="
          fixed
          top-0
          right-0
          h-full
          w-80
          bg-white
          z-50
          shadow-xl
          p-6
        "
      >
        <div className="flex justify-between items-center mb-8">
          <img
            src={logo}
            alt="IndiaEduCore"
            className="h-10"
          />

          <button
            onClick={() => setMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-5">

          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/features"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            Features
          </NavLink>

          <NavLink
            to="/pricing"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            Pricing
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            Contact
          </NavLink>

          <div className="border-t pt-5 mt-3 flex flex-col gap-3">

            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="
                text-center
                px-5 py-3
                rounded-xl
                border
                font-medium
              "
            >
              Login
            </Link>

            <Link
              to="/demo"
              onClick={() => setMobileOpen(false)}
              className="
                text-center
                px-5 py-3
                rounded-xl
                bg-blue-600
                text-white
                font-medium
              "
            >
              Book Free Demo
            </Link>

          </div>
        </div>
      </div>
    </>
  )}
</>
);
}
