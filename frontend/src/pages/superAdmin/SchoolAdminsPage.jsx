import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";

export default function SchoolAdminsPage() {

  const { toggleSchoolAdmin,  resetSchoolAdminPassword} = useSuperAdminStore();

  const navigate = useNavigate();
  const { schoolId } = useParams();
  const { showToast } = useToast();

  const { getSchoolAdmins, loading } = useSuperAdminStore();
 
  const [school, setSchool] = useState(null);
  const [admins, setAdmins] = useState([]);

  

  const fetchData = useCallback(async () => {
  try {
    const data = await getSchoolAdmins(schoolId);

    setSchool(data.school);
    setAdmins(data.admins || []);
  } catch (error) {
    showToast(
      error.response?.data?.error || "Failed to load admins",
      "error"
    );
  }
}, [schoolId, getSchoolAdmins, showToast]);


useEffect(() => {

    fetchData();

  }, [fetchData]);



  const handleToggle = async (userId) => {

  try {

    const data =
      await toggleSchoolAdmin(userId);

    showToast(data.message, "success");

    fetchData();

  } catch (error) {

    showToast(
      error.response?.data?.error ||
      "Failed",
      "error"
    );

  }

};

const handleReset = async (userId) => {

  try {

    const data =
      await resetSchoolAdminPassword(userId);

    showToast(
      `Temporary Password: ${data.temp_password}`,
      "success"
    );

  } catch (error) {

    showToast(
      error.response?.data?.error ||
      "Failed",
      "error"
    );

  }

};

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              School Admins
            </h1>

            <p className="text-gray-500 mt-1">
              {school?.name}
            </p>

          </div>

          <button
            onClick={() =>
              navigate(
                `/super-admin/schools/${schoolId}/admins/create`
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add School Admin
          </button>

        </div>

      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Name
                </th>

                <th className="px-4 py-3 text-left">
                  Email
                </th>

                <th className="px-4 py-3 text-left">
                  Phone
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Password Change
                </th>

                <th className="px-4 py-3 text-centre">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {admins.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No school admins found.
                  </td>

                </tr>

              ) : (

                admins.map((admin) => (

                  <tr
                    key={admin.id}
                    className="border-t"
                  >

                    <td className="px-4 py-3">
                      {admin.name}
                    </td>

                    <td className="px-4 py-3">
                      {admin.email}
                    </td>

                    <td className="px-4 py-3">
                      {admin.phone}
                    </td>

                    <td className="px-4 py-3">

                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          admin.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {admin.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td className="px-4 py-3">

                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          admin.force_password_change
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {admin.force_password_change
                          ? "Required"
                          : "Completed"}
                      </span>

                    </td>

                    <td className="px-4 py-3">

                      <div className="flex gap-2">

                        <button
                          onClick={() => handleReset(admin.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                        >
                          Reset Password
                        </button>

                        <button
                          onClick={() => handleToggle(admin.id)}
                          className={`px-3 py-1 rounded text-white ${
                            admin.is_active
                              ? "bg-red-600"
                              : "bg-green-600"
                          }`}
                        >
                          {admin.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}