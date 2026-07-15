import { useNavigate, useParams } from "react-router-dom";
import { FolderTree, Pencil, Trash2 } from "lucide-react";

export default function SchoolClassTable({
    schoolClasses,
    onEdit,
    onDelete,
}) {
    const navigate = useNavigate();
    const { schoolSlug } = useParams();

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <table className="min-w-full">

                <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Class
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Display Order
                        </th>

                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                    {schoolClasses.map((schoolClass, index) => (

                        <tr
                            key={schoolClass.id}
                            className={`
                                transition-colors
                                hover:bg-slate-50
                                ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                            `}
                        >

                            <td className="px-6 py-4">

                                <p className="font-semibold text-slate-900">
                                    {schoolClass.name}
                                </p>

                            </td>

                            <td className="px-6 py-4">

                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                                    {schoolClass.display_order}
                                </span>

                            </td>

                            <td className="px-6 py-4">

                                <div className="flex items-center justify-center gap-2">

                                    <button
                                        type="button"
                                        title="Manage Sections"
                                        onClick={() =>
                                            navigate(
                                                `/school/${schoolSlug}/teacher/academic-structure/classes/${schoolClass.id}/sections`
                                            )
                                        }
                                        className="rounded-xl p-2.5 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        <FolderTree size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        title="Edit Class"
                                        onClick={() => onEdit(schoolClass)}
                                        className="rounded-xl p-2.5 text-sky-600 transition hover:bg-sky-50 hover:text-sky-700"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        title="Delete Class"
                                        onClick={() => onDelete(schoolClass)}
                                        className="rounded-xl p-2.5 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
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