import { useState, useRef, useEffect } from "react";
import {
  Menu,
  ChevronRight,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPageTitle } from "../../config/pageTitles";
import { useAuthStore } from "../../store/authStore";
import logo from "../../assets/logo.png";

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [openMenu, setOpenMenu] = useState(false);

  const menuRef = useRef(null);

  const roleLabel = {
    teacher: "Teacher",
    school_admin: "School Admin",
    super_admin: "Super Admin",
  };

  const title = getPageTitle(location.pathname);

  const initials =
    user?.name
      ?.split(" ")
      ?.map((i) => i[0])
      ?.join("")
      ?.substring(0, 2)
      ?.toUpperCase() || "U";

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">

      <div className="flex h-full items-center justify-between px-6">

        {/* LEFT */}

        <div className="flex items-center gap-6">

          {/* Logo */}

          <div className="flex items-center gap-3 select-none h-20">

            
             
                      <img
                        src={logo}
                        alt="IndiaEduCore"
                        className="h-14 w-auto object-contain"
                      />
            
                      {/* Uncomment if desired */}
            
                      <div className="hidden lg:block leading-tight">
                        <div className="text-xl font-extrabold tracking-tight">
                          <span className="text-slate-900">INDIA</span>
                          <span className="text-teal-600">EDU</span>
                          <span className="text-orange-600">CORE</span>
                        </div>
            
                        <div className="text-xs text-gray-600">
                          AI Powered Assessment Plateform
                        </div>
                      </div>
            
                      
                  </div>

          {/* Sidebar Toggle */}

          <button
            onClick={onToggleSidebar}
            className="rounded-xl p-2.5 transition hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}

          <div className="hidden md:flex items-center gap-2">

            <h1 className="text-lg font-semibold text-slate-900">
              {title}
            </h1>

            <ChevronRight
              size={16}
              className="text-slate-400"
            />

            <span className="text-sm text-slate-500">
              {roleLabel[user?.role]}
            </span>

          </div>

        </div>

        {/* RIGHT */}

        <div
          className="relative"
          ref={menuRef}
        >

          <button
            onClick={() => setOpenMenu((v) => !v)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">

              {initials}

            </div>

            <div className="hidden sm:block text-left">

              <div className="text-sm font-semibold text-slate-800">
                {user?.name}
              </div>

              <div className="text-xs text-slate-500">
                {roleLabel[user?.role]}
              </div>

            </div>

            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMenu ? "rotate-180" : ""
              }`}
            />

          </button>

          {openMenu && (

            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              <div className="border-b border-slate-100 px-5 py-4">

                <div className="font-semibold text-slate-800">
                  {user?.name}
                </div>

                <div className="text-sm text-slate-500">
                  {roleLabel[user?.role]}
                </div>

              </div>

              <button
                className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <User size={18} />

                My Profile

              </button>

              <div className="border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}