import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { useSchoolStore } from "../store/schoolStore";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import PageTransition from "../components/common/PageTransition";

export default function DashboardLayout() {
  const { schoolSlug } = useParams();

  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= 1024
  );

  const fetchExamOptions = useSchoolStore(
    (s) => s.fetchExamOptions
  );


const examOptionsSchoolSlug = useSchoolStore(
  (s) => s.examOptionsSchoolSlug
);

  const fetchSubscriptionSummary = useSchoolStore(
    (s) => s.fetchSubscriptionSummary
  );


const subscriptionSummarySchoolSlug = useSchoolStore(
  (s) => s.subscriptionSummarySchoolSlug
);

  const isDesktop = window.innerWidth >= 1024;

  useEffect(() => {
  if (!schoolSlug) return;

  if (examOptionsSchoolSlug !== schoolSlug) {
    fetchExamOptions(schoolSlug);
  }

  if (subscriptionSummarySchoolSlug !== schoolSlug) {
    fetchSubscriptionSummary(schoolSlug);
  }

}, [
  schoolSlug,
  examOptionsSchoolSlug,
  subscriptionSummarySchoolSlug,
  fetchExamOptions,
  fetchSubscriptionSummary,
]);

  // Auto close drawer after navigation on mobile
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [location.pathname,isDesktop]);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <Navbar
        onToggleSidebar={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      <div className="relative flex flex-1 overflow-hidden">

        {/* Mobile Overlay */}

        {sidebarOpen && !isDesktop && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="
              fixed
              inset-0
              z-30
              bg-black/40
              lg:hidden
            "
          />
        )}

        <Sidebar
          open={sidebarOpen}
        />

        <div className="flex min-w-0 flex-1 flex-col">

          <main className="flex flex-1 flex-col overflow-y-auto">

            <div className="flex-1 w-full px-2 py-3 lg:px-8 lg:py-6">

              <PageTransition>

                <Outlet />

              </PageTransition>

            </div>

             <Footer />

          </main>

        </div>

      </div>

     

    </div>
  );
}