import { useEffect } from "react";

import {
  useSuperAdminStore
} from "../../store/superAdminStore";

export default function LoginLogsPage() {

  const {
    loading,
    loginLogsData,
    loginStats,
    fetchLoginLogs
  } = useSuperAdminStore();

  useEffect(() => {
    fetchLoginLogs();
  }, []);

  const logs = loginLogsData || [];
  const stats = loginStats || {};

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Login Logs
        </h1>

        <p className="text-gray-500">
          Last 100 login attempts
        </p>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white border rounded-xl p-5">
          <div className="text-gray-500 text-sm">
            Total
          </div>

          <div className="text-3xl font-bold">
            {stats.total || 0}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="text-gray-500 text-sm">
            Successful
          </div>

          <div className="text-3xl font-bold text-green-600">
            {stats.success || 0}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="text-gray-500 text-sm">
            Failed
          </div>

          <div className="text-3xl font-bold text-red-600">
            {stats.failed || 0}
          </div>
        </div>

      </div>

      {/* Table */}

      <div className="bg-white border rounded-xl overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                IP Address
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Time
              </th>

            </tr>

          </thead>

          <tbody>

            {logs.map(log => (

              <tr
                key={log.id}
                className="border-t"
              >

                <td className="p-3">
                  {log.email}
                </td>

                <td className="p-3">
                  {log.ip_address}
                </td>

                <td className="p-3">

                  {log.success ? (

                    <span className="text-green-600">
                      Success
                    </span>

                  ) : (

                    <span className="text-red-600">
                      Failed
                    </span>

                  )}

                </td>

                <td className="p-3">
                  {log.timestamp}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}