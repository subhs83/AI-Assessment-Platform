// src/components/teacher/results/ResultTable.jsx

import ResultRow from "./ResultRow";

export default function ResultTable({
  results,
  examUid,
  routes,
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full text-sm">

          <thead className="bg-gray-50 text-left">

            <tr>

              <th className="p-3">
                #
              </th>

              <th className="p-3">
                Student
              </th>

              <th className="p-3">
                Class
              </th>

              <th className="p-3">
                Roll
              </th>

              <th className="p-3">
                Score
              </th>

              <th className="p-3">
                %
              </th>

              <th className="p-3">
                Attempts
              </th>

              <th className="p-3">
                Violation
              </th>

              <th className="p-3">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {results.map((result, index) => (

              <ResultRow
                key={result.id}
                result={result}
                index={index}
                examUid={examUid}
                routes={routes}
              />

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}