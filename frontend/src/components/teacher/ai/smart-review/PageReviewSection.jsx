import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import AssetList from "./AssetList";
import resolvePageAssets from "./resolvePageAssets";
import MathRenderer from "./MathRenderer";
import ContentRenderer from "./ContentRenderer";

export default function PageReviewSection({
  pages = [],
  assets = {},
  expandedPages,
  onTogglePage,
}) {
  return (
    <div className="space-y-3">
      {pages.map((page, index) => {
        const pageKey = page.page_number ?? index + 1;
        const expanded = expandedPages[pageKey];

        const pageAssets = resolvePageAssets(page, assets);

        return (
          <div
            key={pageKey}
            className="overflow-hidden rounded-2xl border border-slate-200"
          >
            {/* Page Header */}

            <button
              type="button"
              onClick={() => onTogglePage(pageKey)}
              className="flex w-full items-center justify-between gap-4 bg-white p-4 text-left transition hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  Page {pageKey}
                </p>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                  {page.figure_ids?.length > 0 && (
                    <span>
                      {page.figure_ids.length} figure
                      {page.figure_ids.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  {page.equation_ids?.length > 0 && (
                    <span>
                      {page.equation_ids.length} equation
                      {page.equation_ids.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  {page.graph_ids?.length > 0 && (
                    <span>
                      {page.graph_ids.length} graph
                      {page.graph_ids.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  {page.table_ids?.length > 0 && (
                    <span>
                      {page.table_ids.length} table
                      {page.table_ids.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {expanded ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {/* Page Content */}

            {expanded && (
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                {page.heading && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Heading
                    </p>

                    <p className="mt-1 font-medium text-slate-800">
                      {page.heading}
                    </p>
                  </div>
                )}

                {page.summary && (
                  <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                      Page Summary
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      {page.summary}
                    </p>
                  </div>
                )}

                {/* Source Text */}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Extracted Content
                  </p>

                  <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
                    <ContentRenderer
                        content={page.source_text}
                        assets={assets}
                    />
                  </div>
                </div>

                {/* Assets */}

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AssetList
                    title="Figures"
                    ids={page.figure_ids}
                  />

                  {pageAssets.equations.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Equations
                      </p>

                      <div className="space-y-3">
                        {pageAssets.equations.map((equation) => (
                          <MathRenderer
                            key={equation.id}
                            equation={equation}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <AssetList
                    title="Graphs"
                    ids={page.graph_ids}
                  />

                  <AssetList
                    title="Tables"
                    ids={page.table_ids}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}