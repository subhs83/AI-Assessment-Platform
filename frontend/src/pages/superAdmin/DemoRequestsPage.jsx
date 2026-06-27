import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";


export default function DemoRequestsPage() {
  const [demoToDelete, setDemoToDelete] =  useState(null);
  const navigate = useNavigate();

  const { showToast } = useToast();

  const {
    loading,
    demoRequestsData,
    fetchDemoRequests,
    updateDemoStatus,
    deleteDemoRequest
  } = useSuperAdminStore();

  const demos = demoRequestsData || [];

  useEffect(() => {
    fetchDemoRequests();
  }, [fetchDemoRequests]);

  const handleStatusChange = async (demoId, status) => {

    try {

      const response = await updateDemoStatus(
        demoId,
        status
      );

      showToast(
        response.message,
        "success"
      );

      fetchDemoRequests();

    } catch (error) {

      showToast(
        error.response?.data?.error ||
        "Failed to update status",
        "error"
      );

    }

  };

  
  const handleDelete = async () => {

  if (!demoToDelete) return;

  try {

    const response =
      await deleteDemoRequest(
        demoToDelete
      );

    showToast(
      response.message,
      "success"
    );

    setDemoToDelete(null);

  } catch (error) {

    showToast(
      error.response?.data?.error ||
      "Failed to delete demo request",
      "error"
    );

  }

};

  const getStatusBadge = (status) => {

    switch (status) {

      case "new":
        return "bg-yellow-100 text-yellow-800";

      case "contacted":
        return "bg-blue-100 text-blue-800";

      case "closed":
        return "bg-green-100 text-green-800";

      case "converted":
        return "bg-purple-100 text-purple-800";

      default:
        return "bg-gray-100 text-gray-700";

    }

  };

  return (
    <>
    <div>

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-2xl font-bold">
            Demo Requests
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage demo inquiries and convert them into schools.
          </p>

        </div>

      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-left">

              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : demos.length === 0 ? (

              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No demo requests found.
                </td>
              </tr>

            ) : (

              demos.map((demo) => (

                <tr
                  key={demo.id}
                  className="border-t"
                >

                  <td className="px-4 py-3">
                    {demo.school_name}
                  </td>

                  <td className="px-4 py-3">
                    {demo.name}
                  </td>

                  <td className="px-4 py-3">
                    {demo.phone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {demo.email || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {demo.size || "-"}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        demo.status
                      )}`}
                    >
                      {demo.status}
                    </span>

                  </td>

                  <td className="px-4 py-3">
                    {demo.created_at}
                  </td>

                  <td className="px-4 py-3">

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          handleStatusChange(
                            demo.id,
                            "contacted"
                          )
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Contacted
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            demo.id,
                            "closed"
                          )
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Close
                      </button>

                      {demo.status !== "converted" && (

                        <button
                          onClick={() =>
                            navigate(
                              "/super-admin/schools/create",
                              {
                                state: {
                                  demo
                                }
                              }
                            )
                          }
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Convert
                        </button>

                      )}

                      <button
                        onClick={() =>
                          handleDelete(demo.id)
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
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

    <ConfirmModal
          open={!!demoToDelete}
          title="Delete Demo Request"
          description="
            This demo request will be permanently removed.
            This action cannot be undone.
          "
          confirmText="Delete Request"
          variant="danger"
          onClose={() =>
            setDemoToDelete(null)
          }
          onConfirm={handleDelete}
        />

    </>
  );

}