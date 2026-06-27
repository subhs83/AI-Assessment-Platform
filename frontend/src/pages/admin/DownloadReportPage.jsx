import { useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

import {
  Download,
  FileSpreadsheet,
  Users,
  ClipboardList,
  BarChart3,
} from "lucide-react";

export default function DownloadReportPage() {
 
   const handleDownload = async ( apiCall, filename ) => {
  try {

    const response = await apiCall();

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      filename
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {

    console.error(
      "Download failed",
      error
    );

  }
};
  const { schoolSlug } = useParams();

  return (
  <div className="space-y-8">

    {/* Header */}
    <div className="flex items-center gap-4">

      <div className="rounded-2xl bg-green-100 p-3">

        <Download
          size={24}
          className="text-green-600"
        />

      </div>

      <div>

        <h1 className="text-3xl font-bold text-gray-900">
          Download Reports
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Export school reports and performance data as CSV files.
        </p>

      </div>

    </div>


    {/* Cards */}
    <div className="grid gap-6 md:grid-cols-3">

      {/* Teacher Report */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">

        <div className="mb-4 flex items-center gap-3">

          <div className="rounded-xl bg-blue-100 p-3">

            <Users
              size={20}
              className="text-blue-600"
            />

          </div>

          <div>

            <h2 className="font-semibold text-gray-900">
              Teacher Performance Report
            </h2>
    
            <p className="text-sm text-gray-500">
              Compare teacher activity and student outcomes.
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            handleDownload(
              () =>
                adminApi.downloadTeacherReport(
                  schoolSlug
                ),
              "teacher_performance.csv"
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >

          <FileSpreadsheet size={18} />

          Download CSV

        </button>

      </div>


      {/* Exam Report */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">

        <div className="mb-4 flex items-center gap-3">

          <div className="rounded-xl bg-indigo-100 p-3">

            <ClipboardList
              size={20}
              className="text-indigo-600"
            />

          </div>

          <div>

            <h2 className="font-semibold text-gray-900">
              Exam Performance Report
            </h2>

            <p className="text-sm text-gray-500">
              Exam-wise performance statistics.
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            handleDownload(
              () =>
                adminApi.downloadExamPerformanceReport(
                  schoolSlug
                ),
              "exam_performance.csv"
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >

          <FileSpreadsheet size={18} />

          Download CSV

        </button>

      </div>


      {/* Summary Report */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">

        <div className="mb-4 flex items-center gap-3">

          <div className="rounded-xl bg-green-100 p-3">

            <BarChart3
              size={20}
              className="text-green-600"
            />

          </div>

          <div>

            <h2 className="font-semibold text-gray-900">
              School Summary Report
            </h2>

            <p className="text-sm text-gray-500">
              Overall school statistics and averages.
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            handleDownload(
              () =>
                adminApi.downloadSummaryReport(
                  schoolSlug
                ),
              "school_summary.csv"
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700"
        >

          <FileSpreadsheet size={18} />

          Download CSV

        </button>

      </div>

    </div>

  </div>
);
}