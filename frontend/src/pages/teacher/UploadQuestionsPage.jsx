import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { teacherApi } from "../../api/teacherApi";
import { teacherRoutes } from "../../routes/teacherRoutes";
import API from "../../api/client";

import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import  LoadingOverlay  from "../../components/common/LoadingOverlay";


import {
  UploadCloud,
  X,
  ArrowLeft,
  Upload,
   Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Table2
} from "lucide-react";

export default function UploadQuestionsPage() {
  const { schoolSlug } = useParams();

  const routes = teacherRoutes(schoolSlug);
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const [showInstructions, setShowInstructions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // -------------------------
  // FETCH EXAMS
  // -------------------------
  const fetchExams = useCallback(async () => {
    try {
      
      const res = await teacherApi.getDashboard(schoolSlug);

      const exams = res.data?.data?.ai_exams || [];
      const draftExams = exams.filter(
      (exam) => exam.display_status !== "expired"
    );
      setExams(draftExams);
    } catch (err) {
      console.log(err);

      showToast(
        "Failed to load exams",
        "error"
      );
    }
  },[schoolSlug, showToast]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // -------------------------
  // UPLOAD
  // -------------------------
  const handleUpload = async () => {
    if (!selectedExam) {
      showToast(
        "Please select an exam",
        "info"
      );
      return;
    }

    if (!file) {
      showToast(
        "Please select an Excel file",
        "error"
      );
      return;
    }

    const formData = new FormData();

    formData.append("excel_file", file);

    try {
      setIsUploading(true);
      setLoading(true);

      const res =
        await teacherApi.uploadQuestions(
          schoolSlug,
          selectedExam,
          formData
        );

      showToast(
        res.data.message || "Upload successful",
        "success"
      );

      navigate(
        routes.exams.questions(selectedExam)
      );
    } catch (err) {
      console.log(err);

      showToast(
        "Upload failed. Please try again.",
        "error"
      );
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  return (
    <>
    {isUploading && (
  <LoadingOverlay message="Uploading Questions..." />
)}
    
    <div className="max-w-2xl mx-auto space-y-6">

      {/* HEADER */}
      <PageHeader
        title="Upload Questions"
        description="Prepare questions only using the sample Excel template and upload them directly to an exam."
      />

      {/* EXAM SELECT */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">

        <label className="block mb-2 font-medium">
          Select Exam
        </label>

        <select
          className="w-full border rounded-lg p-2"
          value={selectedExam}
          onChange={(e) =>
            setSelectedExam(e.target.value)
          }
        >
          <option value="">
            -- Select Exam --
          </option>

          {exams.map((exam) => (
            <option
              key={exam.id}
              value={exam.id}
            >
              {exam.title}
            </option>
          ))}
        </select>

      </div>
      
      {/* Downloaded section */}
      <div className="border rounded-xl bg-blue-50 shadow-sm p-5">

        {/* TOP */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Sample Excel Template
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Download the template and replace only the content while keeping the same format.
            </p>
          </div>

          <a
            href={`${API.defaults.baseURL}/static/downloads/sampleQuiz.xlsx`}
            className="
              inline-flex items-center justify-center gap-2
              px-4 py-2 rounded-lg
              bg-blue-600 text-white
              hover:bg-blue-700
              transition
              font-medium
              whitespace-nowrap
            "
          >
            <Download size={18} />
            Download Sample File
          </a>

        </div>

        {/* TOGGLE */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="
            mt-4
            flex items-center gap-2
            text-sm font-medium text-blue-700
            hover:text-blue-900
            transition
          "
        >
          {showInstructions ? (
            <>
              <ChevronUp size={16} />
              Hide Instructions
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Instructions
            </>
          )}
        </button>

        {/* BODY */}
        {showInstructions && (
          <div className="mt-5 border-t pt-5">

            <div className="space-y-3 text-sm text-gray-700">

              <div className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Replace only question and option values.</span>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Keep the same column names.</span>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Do not rename, remove, or reorder columns.</span>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  Keep only the questions you want to import and delete the remaining sample rows.
                </span>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Correct answer should be A, B, C or D.</span>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Supported formats: .xlsx and .xls.</span>
              </div>

            </div>

            {/* REQUIRED COLUMNS */}
            <div className="mt-5 bg-white border rounded-xl p-4">

              <div className="flex items-center gap-2 mb-3 font-semibold text-gray-800">
                <Table2 size={18} />
                Required Columns
              </div>

              <div className="overflow-x-auto">
                <div className="
                  inline-flex
                  gap-2
                  text-xs md:text-sm
                  font-mono
                  whitespace-nowrap
                ">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    question_text
                  </span>

                  <span className="bg-gray-100 px-2 py-1 rounded">
                    option_a
                  </span>

                  <span className="bg-gray-100 px-2 py-1 rounded">
                    option_b
                  </span>

                  <span className="bg-gray-100 px-2 py-1 rounded">
                    option_c
                  </span>

                  <span className="bg-gray-100 px-2 py-1 rounded">
                    option_d
                  </span>

                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                    correct_option
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* UPLOAD BOX */}
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">

        {/* FILE AREA */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition">

          {!file ? (
            <>
              <UploadCloud
                className="mx-auto text-gray-400"
                size={32}
              />

              <p className="text-sm text-gray-600 mt-2">
                Drag & drop Excel file here or click to select
              </p>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
                className="mt-4 block w-full text-sm"
              />
            </>
          ) : (
            <div className="flex items-center justify-between bg-white border rounded-lg p-3">

              <span className="text-sm font-medium">
                {file.name}
              </span>

              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>

            </div>
          )}

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">

          <Button
            variant="secondary"
            onClick={() =>
              navigate(routes.exams.list)
            }
          >
            <ArrowLeft size={16} />
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={loading}
          >
            <Upload size={16} />
            {loading
              ? "Uploading..."
              : "Upload File"}
          </Button>

        </div>

      </div>

    </div>
    </>
  );
}