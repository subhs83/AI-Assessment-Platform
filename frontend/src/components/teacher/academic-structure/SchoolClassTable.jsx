import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, FolderTree, } from "lucide-react";

export default function SchoolClassTable({
  schoolClasses,
  onEdit,
  onDelete,
}) {

  const navigate = useNavigate();

  const { schoolSlug } = useParams();


  
  return (
    <div className="bg-white rounded-lg border overflow-hidden">

      <table className="w-full">

        <thead>

          <tr className="bg-gray-50">

            <th className="text-left p-3 font-medium">
              Class
            </th>

            <th className="text-left p-3 font-medium">
              Display Order
            </th>

            <th className="text-center p-3 font-medium">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {schoolClasses.map((schoolClass) => (

            <tr
              key={schoolClass.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-3">
                {schoolClass.name}
              </td>

              <td className="p-3">
                {schoolClass.display_order}
              </td>

              <td className="p-3">

                <div className="flex items-center justify-center gap-2">

                  <button
                    type="button"
                    title="Manage Sections"
                    onClick={() =>
                      navigate(
                        `/school/${schoolSlug}/teacher/academic-structure/classes/${schoolClass.id}/sections`
                      )
                    }
                    className="
                      p-2
                      rounded-lg
                      text-indigo-600
                      hover:bg-indigo-50
                      hover:text-indigo-700
                      transition
                    "
                  >
                    <FolderTree size={18} />
                  </button>

                  <button
                    type="button"
                    title="Edit Class"
                    onClick={() => onEdit(schoolClass)}
                    className="
                      p-2
                      rounded-lg
                      text-blue-600
                      hover:bg-blue-50
                      hover:text-blue-700
                      transition
                    "
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    title="Delete Class"
                    onClick={() => onDelete(schoolClass)}
                    className="
                      p-2
                      rounded-lg
                      text-red-600
                      hover:bg-red-50
                      hover:text-red-700
                      transition
                    "
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}