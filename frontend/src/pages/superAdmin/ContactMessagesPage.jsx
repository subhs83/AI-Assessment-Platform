import { useEffect, useState } from "react";

import { useSuperAdminStore } from "../../store/superAdminStore";
import { useToast } from "../../components/ui/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";


export default function ContactMessagesPage() {
const [messageToDelete, setMessageToDelete] = useState(null);
  const { showToast } = useToast();

  const {
    loading,
    contactMessagesData,
    fetchContactMessages,
    updateContactStatus,
    deleteContactMessage
  } = useSuperAdminStore();

  const messages = contactMessagesData || [];

  useEffect(() => {
    fetchContactMessages();
  }, [fetchContactMessages]);

  const handleStatusChange = async (
    messageId,
    status
  ) => {

    try {

      const response = await updateContactStatus(
        messageId,
        status
      );

      showToast(
        response.message,
        "success"
      );

      fetchContactMessages();

    } catch (error) {

      showToast(
        error.response?.data?.error ||
        "Failed to update status",
        "error"
      );

    }

  };

  const handleDelete = async () => {

  if (!messageToDelete) return;

  try {

    const response =
      await deleteContactMessage(
        messageToDelete
      );

    showToast(
      response.message,
      "success"
    );

    setMessageToDelete(null);

  } catch (error) {

    showToast(
      error.response?.data?.error ||
      "Failed to delete message",
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

      default:
        return "bg-gray-100 text-gray-700";

    }

  };

  return (
    <>
    <div>

      <div className="mb-6">

        <h1 className="text-2xl font-bold">
          Contact Messages
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage contact inquiries received from the website.
        </p>

      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-left">

              <th className="px-4 py-3">
                Name
              </th>

              <th className="px-4 py-3">
                Phone
              </th>

              <th className="px-4 py-3">
                Email
              </th>

              <th className="px-4 py-3">
                Message
              </th>

              <th className="px-4 py-3">
                Status
              </th>

              <th className="px-4 py-3">
                Date
              </th>

              <th className="px-4 py-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-8"
                >
                  Loading...
                </td>

              </tr>

            ) : messages.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-8 text-gray-500"
                >
                  No contact messages found.
                </td>

              </tr>

            ) : (

              messages.map((msg) => (

                <tr
                  key={msg.id}
                  className="border-t"
                >

                  <td className="px-4 py-3">
                    {msg.name}
                  </td>

                  <td className="px-4 py-3">
                    {msg.phone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {msg.email || "-"}
                  </td>

                  <td className="px-4 py-3 max-w-sm">
                    <div className="line-clamp-2">
                      {msg.message}
                    </div>
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        msg.status
                      )}`}
                    >
                      {msg.status}
                    </span>

                  </td>

                  <td className="px-4 py-3">
                    {msg.created_at}
                  </td>

                  <td className="px-4 py-3">

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          handleStatusChange(
                            msg.id,
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
                            msg.id,
                            "closed"
                          )
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Close
                      </button>

                      <button
                        onClick={() =>
                          setMessageToDelete(msg.id)
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
  open={!!messageToDelete}
  title="Delete Message"
  description="
    This contact message will be permanently removed.
    This action cannot be undone.
  "
  confirmText="Delete Message"
  variant="danger"
  onClose={() =>
    setMessageToDelete(null)
  }
  onConfirm={handleDelete}
/>
    </>
  );

}