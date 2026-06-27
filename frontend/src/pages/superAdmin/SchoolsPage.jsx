import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Power, Trash2, CalendarPlus,RotateCcw  } from "lucide-react";
import { superAdminApi } from "../../api/superAdminApi";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function SchoolsPage() {

  const [showDateModal, setShowDateModal] = useState(false);

  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  const [selectedDate, setSelectedDate] =  useState("");

  const [schoolToDelete, setSchoolToDelete] = useState(null);

  const navigate = useNavigate();

  const { showToast } = useToast();

  const { deleteSchool } = useSuperAdminStore();

  const {
    schools,
    schoolsLoading,
    schoolsError,
    fetchSchools,
    toggleSchool,
    extendSchoolValidity,
    resetSchoolValidity
  } = useSuperAdminStore();

  useEffect(() => {
    fetchSchools();
  }, []);

  
  const handleSetExpiryDate = async () => {

    if (!selectedDate) return;

    try {

      await extendSchoolValidity(
        selectedSchoolId,
        {
          expiry_date: selectedDate
        }
      );

      showToast(
        "Expiry date updated successfully",
        "success"
      );

      setShowDateModal(false);

      setSelectedDate("");

      fetchSchools();

    } catch (err) {

      showToast(
        err.response?.data?.error ||
        "Failed to update expiry",
        "error"
      );

    }

  };

  const handleExtendValidity = async (id, days) => {
      try {
        await extendSchoolValidity( id,  {  days  } );

        showToast(
          "School extended successfully",
          "success"
        );

        fetchSchools();

      } catch (err) {

        showToast(
          err.response?.data?.error ||
          "Failed to extend",
          "error"
        );

      }

    };

  const handleResetValidity = async (schoolId) => {

    try {

      const response =
        await resetSchoolValidity(
          schoolId
        );

      showToast(
        response.message,
        "success"
      );

      fetchSchools();

    } catch (error) {

      showToast(
        error.response?.data?.error ||
        "Failed to reset validity",
        "error"
      );

    }

  };

  const handleDelete = async () => {

  if (!schoolToDelete) return;

  try {

    const response =
      await deleteSchool(
        schoolToDelete
      );

    showToast(
      response.message,
      "success"
    );

    setSchoolToDelete(null);

  } catch (error) {

    showToast(
      error.response?.data?.error ||
      "Failed to delete school",
      "error"
    );

  }

};

  if (schoolsLoading) {

    return (
      <div className="p-4">
        Loading schools...
      </div>
    );

  }

  if (schoolsError) {

    return (
      <div className="p-4 text-red-500">
        {schoolsError}
      </div>
    );

  }

  return (
    <>
    <div className="p-4 space-y-4">

      {/* Header */}
      <div>

        <h1 className="text-2xl font-bold">
          Manage Schools
        </h1>

        <p className="text-gray-500">
          Create, activate or manage schools
        </p>

      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="border-b bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Slug
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Expiry
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {schools.map((s) => (

              <tr
                key={s.id}
                className="border-b"
              >

                <td className="p-3 font-medium">
                  {s.name}
                </td>

                <td className="p-3">
                  {s.slug}
                </td>

                <td className="p-3">
                  {s.email}
                </td>

                <td className="p-3">
                  {s.expiry_date || "Unlimited"}
                </td>

                <td className="p-3">

                  {s.is_active ? (

                    <span className="text-green-600">
                      Active
                    </span>

                  ) : (

                    <span className="text-red-500">
                      Inactive
                    </span>

                  )}

                </td>

                <td className="px-4 py-3">

                  <div className="flex flex-wrap gap-2">

                    <button
                      onClick={() =>
                        navigate(
                          `/super-admin/schools/${s.id}/edit`
                        )
                      }
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      title="Edit School"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        toggleSchool(s.id)
                      }
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      title="Toggle Status"
                    >
                      <Power size={16} />
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/super-admin/schools/${s.id}/admins`
                        )
                      }
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      Admins
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSchoolId(s.id);
                        setShowDateModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                      title="Set Expiry Date"
                    >
                      <CalendarPlus size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handleExtendValidity( s.id, 30 )
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                    >
                      +30d
                    </button>

                    <button
                      onClick={() =>
                        handleExtendValidity( s.id, 90)
                      }
                      className="px-3 py-1 bg-purple-600 text-white rounded text-xs"
                    >
                      +90d
                    </button>

                    <button
                      onClick={() =>
                        handleResetValidity( s.id )
                      }
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs"
                      title="Reset Validity"
                      >
                        <RotateCcw size={16} />
                      </button>
                    
                    <button
                      onClick={() =>
                        setSchoolToDelete(s.id)
                      }
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      title="Delete School"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Date Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-full max-w-md">

              <h2 className="text-lg font-semibold mb-4">
                Set Expiry Date
              </h2>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <div className="flex justify-end gap-3 mt-5">

                <button
                  onClick={() => setShowDateModal(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSetExpiryDate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
      
      <ConfirmModal
  open={!!schoolToDelete}
  title="Delete School"
  description="
    This school and all associated data may be permanently removed.
    This action cannot be undone.
  "
  confirmText="Delete School"
  variant="danger"
  onClose={() =>
    setSchoolToDelete(null)
  }
  onConfirm={handleDelete}
/>
      </>
    );
}