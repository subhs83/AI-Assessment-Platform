import {
  LineChart,
  BarChart3,
} from "lucide-react";

export default function GraphRenderer({ graph }) {
  if (!graph) {
    return null;
  }

  const type = graph.type || "graph";

  /*
   * Current Smart Analysis graph types that can
   * eventually have dedicated renderers.
   */
  if (type === "line_graph") {
    return <LineGraph graph={graph} />;
  }

  return (
    <div className="my-2 inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
      <BarChart3 className="h-3.5 w-3.5" />
      {graph.type || "Graph"}
    </div>
  );
}

/* =========================================================
   LINE GRAPH
========================================================= */

function LineGraph({ graph }) {
  const series = Array.isArray(graph.series)
    ? graph.series
    : [];

  const categories = Array.isArray(graph.x_categories)
    ? graph.x_categories
    : [];

  if (!series.length || !categories.length) {
    return (
      <div className="my-2 inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
        <LineChart className="h-3.5 w-3.5" />
        Line graph
      </div>
    );
  }

  return (
    <div className="my-3 w-full overflow-x-auto">
      <div className="min-w-[420px] rounded-xl border border-slate-200 bg-white p-4">
        {graph.x_axis_label || graph.y_axis_label ? (
          <div className="mb-3 text-xs text-slate-500">
            {graph.x_axis_label && (
              <span>{graph.x_axis_label}</span>
            )}

            {graph.x_axis_label && graph.y_axis_label && (
              <span className="mx-1">•</span>
            )}

            {graph.y_axis_label && (
              <span>{graph.y_axis_label}</span>
            )}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">
                  Series
                </th>

                {categories.map((category) => (
                  <th
                    key={category}
                    className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-600"
                  >
                    {category}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {series.map((item, index) => (
                <tr key={`${item.name || "series"}-${index}`}>
                  <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-700">
                    {item.name || `Series ${index + 1}`}
                  </td>

                  {categories.map((category, categoryIndex) => {
                    const value = item.values?.[categoryIndex];

                    return (
                      <td
                        key={`${category}-${categoryIndex}`}
                        className="border-b border-slate-100 px-3 py-2 text-center text-slate-600"
                      >
                        {value ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {graph.legend?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {graph.legend.map((item) => (
              <span
                key={item}
                className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}