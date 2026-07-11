import { useEffect,useState,Fragment } from "react";

import { useNavigate } from "react-router-dom";
import { Pencil, Power, Trash2, CreditCard, Users  } from "lucide-react";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function SchoolsPage() {

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
  } = useSuperAdminStore();

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);


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
                School
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                School Status
              </th>

              <th className="p-3 text-left">
                Plan
              </th>

              <th className="p-3 text-left">
                Subscription
              </th>

              <th className="p-3 text-left">
                AI Usage
              </th>

              <th className="p-3 text-left">
                Expires
              </th>

            </tr>

          </thead>

          <tbody>

            {schools.map((s) => (
              <Fragment key={s.id}>

              <tr className="border-b" >

                <td className="p-3 font-medium">
                  {s.name}
                </td>

                <td className="p-3">
                  {s.email}
                </td>

                <td className="p-3">
                  {s.is_active ? (

                    <span className="text-green-600">
                      Active
                    </span>

                  ) : (

                    <span className="text-orange-600">
                      Inactive
                    </span>

                  )}
                </td>

                <td className="p-3">
                  {s.plan_code}
                </td>

                <td className="p-3">

                  {s.subscription_status}

                </td>

                 <td className="p-3">

                  {s.used_ai_credits}

                </td>

                 <td className="p-3">

                  {s.expires_at || ""}

                </td>
                  </tr>
                  {/* Action Row */}
                  <tr className="bg-gray-50">

                    <td
                      colSpan={7}
                      className="px-4 py-3"
                    >
                 
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-4">
                        School Management
                    </div>
                  <div className="flex flex-wrap gap-4">

                    <button 
                     onClick={() =>
                        navigate(
                          `/super-admin/schools/${s.id}/admins`
                        )
                      }
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white"
                    >
                      <Users size={16} />
                      School Admins
                    </button>

                    <button 
                    onClick={() =>
                        navigate(
                            `/super-admin/schools/${s.id}/subscription`
                        )
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white"
                    >
                      <CreditCard size={16} />
                      Manage Subscription
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/super-admin/schools/${s.id}/edit`
                        )
                      }
                      className="flex items-center gap-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      title="Edit School"
                    >
                      <Pencil size={16} />
                      Edit School
                    </button>

                    <button
                      onClick={() =>
                        toggleSchool(s.id)
                      }
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded"
                      title="Toggle School Status"
                    >
                      <Power size={16} />
                      Toggle Status
                    </button>

                    
                    <button
                      onClick={() =>
                        setSchoolToDelete(s.id)
                      }
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded"
                      title="Delete School"
                    >
                      <Trash2 size={16} />
                      Delete School
                    </button>
                    

                  </div>

                </td>

              </tr>
            </Fragment>

            ))}

          </tbody>

        </table>

      </div>

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