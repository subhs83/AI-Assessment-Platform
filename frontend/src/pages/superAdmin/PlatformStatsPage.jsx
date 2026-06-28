import { useEffect } from "react";
import { useSuperAdminStore } from "../../store/superAdminStore";

export default function PlatformStatsPage() {

  const {
    platformStats,
    fetchPlatformStats
  } = useSuperAdminStore();

  useEffect(() => {
    fetchPlatformStats();
  }, [fetchPlatformStats]);

  const stats = platformStats || {};

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Platform Statistics
      </h1>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-6">
          <div className="text-gray-500">
            Schools
          </div>

          <div className="text-3xl font-bold">
            {stats.total_schools || 0}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="text-gray-500">
            Teachers
          </div>

          <div className="text-3xl font-bold">
            {stats.total_teachers || 0}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="text-gray-500">
            Exams
          </div>

          <div className="text-3xl font-bold">
            {stats.total_exams || 0}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="text-gray-500">
            Attempts
          </div>

          <div className="text-3xl font-bold">
            {stats.total_attempts || 0}
          </div>
        </div>

      </div>

    </div>

  );

}