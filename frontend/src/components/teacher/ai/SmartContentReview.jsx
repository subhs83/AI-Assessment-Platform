import {
  Brain,
  CheckCircle2,
  FileText,
  Image,
  Table2,
  Sigma,
  BarChart3,
  
} from "lucide-react";

import { useState } from "react";

import InfoItem from "./smart-review/InfoItem";
import AnalysisSummaryCard from "./smart-review/AnalysisSummaryCard";
import PageReviewSection from "./smart-review/PageReviewSection";
import resolvePageAssets from "./smart-review/resolvePageAssets";

export default function SmartContentReview({
  extractRef,
  analysisReport,
}) {
  const [expandedPages, setExpandedPages] = useState({});

  if (!analysisReport) {
    return null;
  }

  const document = analysisReport.document || {};
  const summary = analysisReport.summary || {};
  const pages = analysisReport.pages || [];
  const assets = analysisReport.assets || {};

  const togglePage = (pageNumber) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageNumber]: !prev[pageNumber],
    }));
  };

  return (
    <section
      ref={extractRef}
      className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Brain className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Smart Analysis Review
              </h2>

              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Beta
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Review the AI-analyzed document structure before generating
              questions.
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Ready
        </span>
      </div>

      {/* =========================================================
          DOCUMENT OVERVIEW
      ========================================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />

          <h3 className="font-semibold text-slate-800">
            Document Overview
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoItem
            label="Document Type"
            value={document.document_type}
          />

          <InfoItem
            label="Subject"
            value={document.subject}
          />

          <InfoItem
            label="Class"
            value={document.class_name}
          />

          <InfoItem
            label="Language"
            value={document.language}
          />

          <InfoItem
            label="Pages"
            value={document.page_count}
          />

          <InfoItem
            label="Analysis Mode"
            value={document.analysis_mode || "full"}
          />
        </div>

        {document.title && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Title
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {document.title}
            </p>
          </div>
        )}
      </div>

      {/* =========================================================
          ANALYSIS SUMMARY
      ========================================================= */}

      <div className="mt-5">
        <h3 className="mb-3 font-semibold text-slate-800">
          Analysis Summary
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <AnalysisSummaryCard
            icon={FileText}
            label="Pages"
            value={document.page_count || 0}
          />

          <AnalysisSummaryCard
            icon={Image}
            label="Figures"
            value={summary.figure_count || 0}
          />

          <AnalysisSummaryCard
            icon={Sigma}
            label="Equations"
            value={summary.equation_count || 0}
          />

          <AnalysisSummaryCard
            icon={BarChart3}
            label="Graphs"
            value={summary.graph_count || 0}
          />

          <AnalysisSummaryCard
            icon={Table2}
            label="Tables"
            value={summary.table_count || 0}
          />
        </div>
      </div>

      {/* =========================================================
          PAGES
      ========================================================= */}

      <PageReviewSection
        pages={pages}
        assets={assets}
        expandedPages={expandedPages}
        onTogglePage={togglePage}
      />

      {/* =========================================================
          BETA NOTE
      ========================================================= */}

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm leading-6 text-amber-800">
          <span className="font-semibold">Smart Analysis is in Beta.</span>{" "}
          AI may occasionally misinterpret document structure, equations or
          visual content. Review the analysis before generating questions.
        </p>
      </div>
    </section>
  );
}




