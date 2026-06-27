import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teacherRoutes } from "../../../routes/teacherRoutes";
import API from "../../../api/client";
import { teacherApi } from "../../../api/teacherApi";
import aiApi from "../../../api/aiApi";
import BackButton from "../../../components/ui/BackButton";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../components/ui/Toast";

import { 
    CheckSquare,
    Square,
    ChevronDown, 
    ChevronUp, 
    Save, 
    RefreshCw,
    FileText,
    ListChecks,
    ClipboardList,
  } from "lucide-react";

export default function AIPreviewPage() {
  const { schoolSlug, requestId } = useParams();
  const navigate = useNavigate();
  const routes = teacherRoutes(schoolSlug);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const [showSource, setShowSource] = useState(false);

  // -------------------------
  // FETCH AI REQUEST
  // -------------------------
  const fetchRequest = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/api/teacher/${schoolSlug}/ai/request/${requestId}`
      );

      setData(res.data.request);
    } catch (err) {
      setError("Failed to load AI generated questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await teacherApi.getDashboard(schoolSlug);
      const exams = res.data?.data?.ai_exams || [];
      const draftExams = exams.filter(
      (exam) => exam.display_status !== "expired"
    );
      setExams(draftExams);
    } catch (err) {
      console.log(err);
    }
  };

  const handleGenerateNewSet = () => {
    navigate(routes.ai.generate, {
      state: {
        source_type: data.source_type,
        source_text: data.source_text,
        topic: data.topic,
        difficulty: data.difficulty,
        question_count: data.question_count,
      },
    });
  };


  useEffect(() => {
    fetchRequest();
    fetchExams();
  }, [requestId]);

  // -------------------------
  // SELECT LOGIC
  // -------------------------
  const toggleSelect = (index) => {
    let updated;

    if (selected.includes(index)) {
      updated = selected.filter((i) => i !== index);
    } else {
      updated = [...selected, index];
    }

    setSelected(updated);
    setSelectAll(updated.length === data?.questions?.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      const all = data.questions.map((_, i) => i);
      setSelected(all);
      setSelectAll(true);
    }
  };

  // -------------------------
  // SAVE TO EXAM
  // -------------------------
  const handleSaveToExam = async () => {
    try {
      setSaving(true);

      if (!selectedExam) {
        showToast("Please select an exam", "info");
        return;
      }

      await aiApi.saveToExam(schoolSlug, {
        request_id: requestId,
        exam_id: selectedExam,
        questions: selected,
      });

      showToast(
        `${selected.length} AI question${
          selected.length > 1 ? "s" : ""
        } added successfully.`,
        "success"
      );

      navigate(routes.exams.list);

    } catch (err) {
      console.error(err);

      showToast(
        err?.response?.data?.message ||
        "Failed to save questions",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // LOADING
  // -------------------------
  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* HEADER */}
      <PageHeader
            title="AI Generated Questions"
            description={""}
            actions={<BackButton to={-1} label="Go Back" />}
          />

      {/* SOURCE (collapsed / expandable) */}
      <div className="border rounded-xl p-4 mb-6 bg-gray-50">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <h2 className="font-semibold">
              Source Content
            </h2>
          </div>

          {data.source_type !== "topic" && (
            <button
              onClick={() => setShowSource(!showSource)}
              className="text-blue-600 flex items-center gap-1 text-sm font-medium"
            >
              {showSource ? (
                <>
                  <ChevronUp size={16} />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Expand
                </>
              )}
            </button>
          )}
        </div>

        {!showSource && (
          <p className="text-gray-700 mt-3 line-clamp-1">
            <b>Topic:</b> {data.source_text || "N/A"}
          </p>
        )}

        {showSource && (
          <div className=" mt-3 border-t pt-3 max-h-64 overflow-y-auto rounded-lg bg-white p-3 text-m text-gray-600 whitespace-pre-wrap">
            <b>Topic:</b> {data.source_text || "N/A"}
          </div>
        )}
      </div>

      {/* SELECT ALL */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">

        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm text-blue-600 font-medium"
        >
          {selectAll ? (
            <CheckSquare size={18} />
          ) : (
            <Square size={18} />
          )}

          {selectAll
            ? "Deselect All"
            : "Select All"}
        </button>

        <div
          className="
            text-sm
            bg-blue-50
            text-blue-700
            px-3
            py-1
            rounded-full
            font-medium
          "
        >
          {selected.length} of {data.questions.length} selected
        </div>

      </div>

      {/* QUESTIONS */}
      <div className="flex items-center gap-2 mb-4">
        <ListChecks size={20} />
        <h2 className="font-semibold text-lg">
          Generated Questions
        </h2>
      </div>
      <div className="space-y-4">
        {data.questions.map((q, index) => (
          <div
              key={index}
              onClick={() => toggleSelect(index)}
              className={`
                border rounded-xl p-4 shadow-sm cursor-pointer transition
                ${
                  selected.includes(index)
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "bg-white hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-start gap-3">

                <input
                  type="checkbox"
                  checked={selected.includes(index)}
                  onChange={() => toggleSelect(index)}
                  className="mt-1"
                />

                <div className="w-full">

                  <div className="flex items-start gap-2 mb-3">

                    <span
                      className="
                        bg-blue-100
                        text-blue-700
                        px-2 py-1
                        rounded-md
                        text-xs
                        font-semibold
                        whitespace-nowrap
                      "
                    >
                      Q{index + 1}
                    </span>

                    <h3 className="font-semibold">
                      {q.question_text}
                    </h3>

                  </div>

                  <div className="ml-2 text-sm space-y-1">
                    <div>A. {q.option_a}</div>
                    <div>B. {q.option_b}</div>
                    <div>C. {q.option_c}</div>
                    <div>D. {q.option_d}</div>
                  </div>

                  <div className="mt-3 text-green-600 text-sm font-medium">
                    Correct Answer: {q.correct_answer}
                  </div>

                </div>
              </div>
            </div>
        ))}
      </div>

      {/* ACTION BAR */}
      <div
        className="
          sticky
          bottom-0
          bg-white
          border-t
          shadow-lg
          p-4
          mt-6
          z-20
        "
      >

        <div className="max-w-5xl mx-auto">

          {selected.length === 0 && (
            <div className="text-sm text-amber-600 mb-3">
              Select at least one question to save.
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end gap-4">

            <div className="flex-1">

              <label className="flex items-center gap-2 mb-2 font-medium">
                <ClipboardList size={16} />
                Select Exam
              </label>

              <select
                className="w-full border p-2 rounded-lg"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
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

            <div className="flex flex-col sm:flex-row gap-2">

              <Button
                variant="secondary"
                onClick={handleGenerateNewSet}
              >
                <RefreshCw size={16} />
                Generate New Set
              </Button>

              <Button
                variant="success"
                onClick={handleSaveToExam}
                disabled={
                  saving ||
                  selected.length === 0 ||
                  !selectedExam
                }
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : "Save Selected Questions"}
              </Button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}