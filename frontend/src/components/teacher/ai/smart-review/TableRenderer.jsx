import { Table2 } from "lucide-react";

export default function TableRenderer({ table }) {
  if (!table) {
    return null;
  }

  const columns = Array.isArray(table.columns)
    ? table.columns
    : [];

  if (!columns.length) {
    return (
      <span className="mx-1 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        <Table2 className="h-3.5 w-3.5" />
        Table
      </span>
    );
  }

  return (
    <div className="my-3 w-full overflow-x-auto">
      <div className="min-w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
}