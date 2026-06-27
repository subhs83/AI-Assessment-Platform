import { useEffect } from "react";
import { useSuperAdminStore } from "../../store/superAdminStore";

export default function SystemHealthPage() {

  const {
    systemHealth,
    fetchSystemHealth
  } = useSuperAdminStore();

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const health = systemHealth || {};

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        System Health
      </h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">

        <div>
          <span className="font-semibold">
            Current Time:
          </span>{" "}
          {health.current_time}
        </div>

        <div>
          <span className="font-semibold">
            Environment:
          </span>{" "}
          {health.environment}
        </div>

        <div>
          <span className="font-semibold">
            Database:
          </span>{" "}
          {health.database}
        </div>

      </div>

    </div>

  );

}