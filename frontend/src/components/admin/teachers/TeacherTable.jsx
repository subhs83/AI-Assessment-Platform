import TeacherRow from "./TeacherRow";

export default function TeacherTable({
  teachers,
  onToggle,
  onReset,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b bg-gray-50">

            <tr className="text-left text-sm font-semibold text-gray-700">

              <th className="px-6 py-4">
                Teacher
              </th>

              <th className="px-6 py-4">
                Email
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Password Change
              </th>

              <th className="px-6 py-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {teachers.map((teacher) => (

              <TeacherRow
                key={teacher.id}
                teacher={teacher}
                onToggle={onToggle}
                onReset={onReset}
              />

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}