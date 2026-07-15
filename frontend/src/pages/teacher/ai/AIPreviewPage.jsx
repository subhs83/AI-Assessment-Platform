import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../../../api/client";
import aiApi from "../../../api/aiApi";
import { teacherApi } from "../../../api/teacherApi";
import { teacherRoutes } from "../../../routes/teacherRoutes";

import BackButton from "../../../components/ui/BackButton";
import PageHeader from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/ui/Toast";

import AISourceCard from "../../../components/teacher/ai/AISourceCard";
import AIQuestionList from "../../../components/teacher/ai/AIQuestionList";
import AISaveBar from "../../../components/teacher/ai/AISaveBar";

import {
  CheckSquare,
  Square,
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

  const fetchRequest = useCallback(async () => {

    try {

      setLoading(true);

      const res = await API.get(
        `/api/teacher/${schoolSlug}/ai/request/${requestId}`
      );

      setData(res.data.request);

    } catch {

      setError("Failed to load AI generated questions");

    } finally {

      setLoading(false);

    }

  }, [schoolSlug, requestId]);

  const fetchExams = useCallback(async () => {

    try {

      const res =
        await teacherApi.getDashboard(schoolSlug);

      const exams =
        res.data?.data?.ai_exams || [];

      setExams(
        exams.filter(
          (exam) =>
            exam.display_status !== "expired"
        )
      );

    } catch (err) {

      console.log(err);

    }

  }, [schoolSlug]);

  useEffect(() => {

    fetchRequest();
    fetchExams();

  }, [fetchRequest, fetchExams]);

  const toggleSelect = (index) => {

    let updated;

    if (selected.includes(index)) {

      updated =
        selected.filter(
          (i) => i !== index
        );

    } else {

      updated = [
        ...selected,
        index,
      ];

    }

    setSelected(updated);

    setSelectAll(
      updated.length ===
      data?.questions?.length
    );

  };

  const handleSelectAll = () => {

    if (selectAll) {

      setSelected([]);
      setSelectAll(false);

      return;

    }

    const all =
      data.questions.map((_, i) => i);

    setSelected(all);
    setSelectAll(true);

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

  const handleSaveToExam = async () => {

    try {

      setSaving(true);

      if (!selectedExam) {

        showToast(
          "Please select an exam",
          "info"
        );

        return;

      }

      await aiApi.saveToExam(
        schoolSlug,
        {
          request_id: requestId,
          exam_id: selectedExam,
          questions: selected,
        }
      );

      showToast(

        `${selected.length} AI question${
          selected.length > 1 ? "s" : ""
        } added successfully.`,

        "success"

      );

      navigate(routes.exams.list);

    } catch (err) {

      showToast(

        err?.response?.data?.message ||
        "Failed to save questions",

        "error"

      );

    } finally {

      setSaving(false);

    }

  };

  if (loading) {

    return (
      <div className="p-6 text-gray-600">
        Loading...
      </div>
    );

  }

  if (error) {

    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );

  }

  return (

    <div className="mx-auto max-w-5xl">

      <PageHeader
        title="AI Generated Questions"
        actions={
          <BackButton
            to={-1}
            label="Go Back"
          />
        }
      />

      <AISourceCard
        data={data}
        showSource={showSource}
        setShowSource={setShowSource}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm font-medium text-blue-600"
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

        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">

          {selected.length} of {data?.questions?.length || 0} selected
        </div>

      </div>

      <AIQuestionList
        questions={data?.questions || []}
        selected={selected}
        toggleSelect={toggleSelect}
      />

      <AISaveBar
        selected={selected}
        saving={saving}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        exams={exams}
        onGenerateNewSet={handleGenerateNewSet}
        onSave={handleSaveToExam}
      />

    </div>

  );

}