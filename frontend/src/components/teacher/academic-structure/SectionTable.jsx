import { Pencil, Trash2 } from "lucide-react";

export default function SectionTable({
  sections,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">

      <table className="w-full">

        <thead>

          <tr className="bg-gray-50">

            <th className="text-left p-3 font-medium">
              Order
            </th>

            <th className="text-left p-3 font-medium">
              Section
            </th>

            <th className="text-center p-3 font-medium">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {sections.map((section) => (

            <tr
              key={section.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-3">
                {section.display_order}
              </td>

              <td className="p-3">
                {section.name}
              </td>

              <td className="p-3">

                <div className="flex items-center justify-center gap-2">

                  <button
                    type="button"
                    title="Edit Section"
                    onClick={() => onEdit(section)}
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
                    title="Delete Section"
                    onClick={() => onDelete(section)}
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