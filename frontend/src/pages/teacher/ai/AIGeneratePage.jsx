
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../../../api/client";
import { useTeacherStore } from "../../../store/teacherStore";
import BackButton from "../../../components/ui/BackButton";
import PageHeader from "../../../components/ui/PageHeader";
import LoadingOverlay from "../../../components/common/LoadingOverlay";
import AITopicSection from "../../../components/teacher/ai/AITopicSection";
import AIFileSection from "../../../components/teacher/ai/AIFileSection";
import AICreditCard from "../../../components/teacher/ai/AICreditCard";
import AIQuestionSettings from "../../../components/teacher/ai/AIQuestionSettings";
import AIGenerateButton from "../../../components/teacher/ai/AIGenerateButton";
import { useToast } from "../../../components/ui/Toast";
import { useSchoolStore } from "../../../store/schoolStore";

export default function AIGeneratePage() {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const {
    aiConfig,
    fetchAIConfig,
    ocrLanguages,
    fetchOcrLanguages,
  } = useTeacherStore();

  const fromHistory = location.state?.fromHistory || false;
  const previousSourceType = location.state?.source_type || "";
  const previousSourceText = location.state?.source_text || "";

  const [topic, setTopic] = useState(
    previousSourceType === "topic"
      ? previousSourceText
      : ""
  );

  const [difficulty, setDifficulty] = useState(
    location.state?.difficulty || "mixed"
  );

  const [bloomsLevel, setBloomsLevel] = useState(
    location.state?.blooms_level || "mixed"
  );

  const [count, setCount] = useState(
    location.state?.question_count || 3
  );

  const [file, setFile] = useState(null);

  const [language, setLanguage] = useState("english");

  const fetchSubscriptionSummary = useSchoolStore(
    (s) => s.fetchSubscriptionSummary
  );

  const fetchDashboard = useTeacherStore(
    (s) => s.fetchDashboard
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subscription = aiConfig?.subscription;

  const aiFeatures = aiConfig?.ai_features ?? {};

  useEffect(() => {
    fetchAIConfig(schoolSlug);
  }, [schoolSlug, fetchAIConfig]);

  useEffect(() => {
    const load = async () => {
      const defaultLanguage =
        await fetchOcrLanguages(schoolSlug);

      setLanguage(defaultLanguage);
    };

    load();
  }, [schoolSlug, fetchOcrLanguages]);

  const handleGenerate = async () => {
    const hasTopic = topic.trim().length > 0;
    const hasFile = file !== null;

    // --------------------------------------------------
    // Validate source
    // --------------------------------------------------

    if (!hasTopic && !hasFile) {
      setError(
        "Please enter a topic or upload a file."
      );

      showToast(
        "Please enter a topic or upload a file.",
        "error"
      );

      return;
    }

    if (hasTopic && hasFile) {
      setError(
        "Please use either Topic or File, not both."
      );

      showToast(
        "Please use either Topic or File, not both.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      // ------------------------------------------------
      // Topic
      // ------------------------------------------------

      if (hasTopic) {
        formData.append(
          "topic",
          topic.trim()
        );
      }

      // ------------------------------------------------
      // File
      // ------------------------------------------------

      if (hasFile) {
        formData.append(
          "file",
          file
        );
      }

      // ------------------------------------------------
      // Generation settings
      // ------------------------------------------------

      formData.append(
        "difficulty",
        difficulty
      );

      formData.append(
        "blooms_level",
        bloomsLevel
      );

      formData.append(
        "question_count",
        count
      );

      formData.append(
        "language",
        language
      );

      // ------------------------------------------------
      // Generate
      // ------------------------------------------------

      const res = await API.post(
        `/api/teacher/${schoolSlug}/ai/generate`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const requestId =
        res.data.request_id;

      if (
        !res.data.success ||
        !requestId
      ) {
        const message =
          res.data.message ||
          "Failed to generate questions.";

        setError(message);
        showToast(message, "error");

        return;
      }

      // ------------------------------------------------
      // Refresh usage/dashboard
      // ------------------------------------------------

      await fetchSubscriptionSummary(
        schoolSlug
      );

      await fetchDashboard(
        schoolSlug
      );

      // ------------------------------------------------
      // Existing final question review
      // ------------------------------------------------

      navigate(
        `/school/${schoolSlug}/teacher/ai/preview/${requestId}`
      );
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        "Failed to generate questions.";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Credit calculation
  // ----------------------------------------------------

  let creditsRequired = 0;

  if (topic.trim()) {
    creditsRequired =
      aiFeatures.TOPIC_QUESTION ?? 0;
  } else if (file) {
    const fileType =
      file.type || "";

    if (fileType === "application/pdf") {
      creditsRequired =
        aiFeatures.PDF_QUESTION ?? 0;
    } else {
      creditsRequired =
        aiFeatures.IMAGE_QUESTION ?? 0;
    }
  }

  return (
    <>
      {loading && (
        <LoadingOverlay
          message="Generating AI Questions..."
        />
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <PageHeader
          title="AI Question Generator"
          description="Generate multiple-choice questions from a topic or from your teaching material."
          actions={
            fromHistory ? (
              <BackButton
                to={-1}
                label="Back to History"
              />
            ) : null
          }
        />

        {/* Topic Section */}
        <AITopicSection
          topic={topic}
          setTopic={setTopic}
        />

        {/* Divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-slate-200" />

          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            OR
          </span>

          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* File Section */}
        <AIFileSection
          file={file}
          setFile={setFile}
          language={language}
          setLanguage={setLanguage}
          ocrLanguages={ocrLanguages}
        />

        {/* AI Credit Card */}
        <AICreditCard
          subscription={subscription}
          creditsRequired={creditsRequired}
        />

        {/* Question Settings */}
        <AIQuestionSettings
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          bloomsLevel={bloomsLevel}
          setBloomsLevel={setBloomsLevel}
          count={count}
          setCount={setCount}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <AIGenerateButton
          loading={loading}
          onGenerate={handleGenerate}
        />

      </div>
    </>
  );
}
