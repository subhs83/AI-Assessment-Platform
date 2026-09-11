import MathText from "../../../common/MathText"

export default function DataTableVisual({ visual }) {
  if (!visual) return null;

   const figure = visual?.figure || { type: "generic" };
  const { title, headers, rows } = visual;

  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    return null;
  }
  // ⬆️ END NEW BRANCH ⬆️

  const DEBUG_TABLE = false;

  if (DEBUG_TABLE) {
    console.log("========== DATA TABLE DEBUG ==========");
    console.log("figure:", figure);
    console.log("headers:", headers);
    console.log("rows:", rows);

    console.log("==================================");
  }
  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {DEBUG_TABLE && (
        <div className="mb-2 rounded bg-slate-900 p-2 text-xs text-white">
          Table: {figure?.type || "generic"}, {figure?.subtype}
        </div>
      )}
      {title && (
        <div className="mb-3 text-sm font-semibold text-slate-700">
          {title}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {headers.map((header, headerIndex) => (
              <tr
                key={`row-${headerIndex}`}
                className={headerIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <th
                  className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  <MathText text={header} />
                </th>
                {rows.map((row, rowIndex) => (
                  <td
                    key={`cell-${headerIndex}-${rowIndex}`}
                    className="border border-slate-300 px-3 py-2 text-slate-700"
                  >
                    <MathText text={row[headerIndex]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}