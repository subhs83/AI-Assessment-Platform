import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar"; // rename Navbar.jsx -> Navbar.jsx
import Footer from "../components/layout/Footer";

import PageTransition from "../components/common/PageTransition";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* ================= NAVBAR ================= */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* ================= APPLICATION ================= */}

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Workspace */}

        <div className="flex min-w-0 flex-1 flex-col">

          <main className="flex-1 overflow-y-auto">

            <div className="w-full px-6 lg:px-8 py-6">

              <PageTransition>

                <Outlet />

              </PageTransition>

            </div>

          </main>

        </div>

      </div>

      {/* Footer */}

      <Footer />

    </div>
  );
}