import { useEffect } from "react";
import { useSuperAdminStore } from "../../store/superAdminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";

export default function SuperAdminDashboardPage() {

  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboard,
  } = useSuperAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  

  if (dashboardLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (dashboardError) {
    return <ErrorState message={dashboardError} />;
  }

  const stats = dashboardData || {};

  return (
    <div className="p-4 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-500">
          Platform overview & system statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <StatCard title="Total Schools" value={stats.total_schools} />
        <StatCard title="Active Schools" value={stats.active_schools} />
        <StatCard title="Total Teachers" value={stats.total_teachers} />
        <StatCard title="Total Students" value={stats.total_students} />
        <StatCard title="Total Exams" value={stats.total_exams} />
        <StatCard title="Total Attempts" value={stats.total_attempts} />
        <StatCard title="Demo Requests" value={stats.total_demo_requests} />
        <StatCard title="Contact Messages" value={stats.total_contact_messages} />

      </div>

      {/* Recent Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Schools */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Recent Schools</h2>

          {stats.recent_schools?.length > 0 ? (
            <ul className="space-y-2">
              {stats.recent_schools.map((s) => (
                <li key={s.id} className="border-b pb-2">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.slug}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>

        {/* Recent Demo Requests */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Demo Requests</h2>

          {stats.recent_demo_requests?.length > 0 ? (
            <ul className="space-y-2">
              {stats.recent_demo_requests.map((d) => (
                <li key={d.id} className="border-b pb-2">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-gray-500">{d.email}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>

      </div>
    </div>
  );
}

/* -----------------------------
   Stat Card
------------------------------*/
function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-bold mt-1">
        {value ?? 0}
      </div>
    </div>
  );
}