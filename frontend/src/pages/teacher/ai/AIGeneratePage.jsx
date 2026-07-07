import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../../../api/client";
import { useTeacherStore } from "../../../store/teacherStore";
import BackButton from "../../../components/ui/BackButton";
import PageHeader from "../../../components/ui/PageHeader";
import  LoadingOverlay  from "../../../components/common/LoadingOverlay";
import {
    Sparkles,
    PenSquare,
    FileText,
    Languages,
    Upload,
    BrainCircuit,
    Settings2,
    CheckCircle2,
    Hash,
    Gauge,
    FileDigit,
  } from "lucide-react";

export default function AIGeneratePage() {
  const { schoolSlug } = useParams();
  const extractRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { ocrLanguages, fetchOcrLanguages} = useTeacherStore();

  const fromHistory = location.state?.fromHistory || false;
  const previousSourceType = location.state?.source_type || "";

  const previousSourceText = location.state?.source_text || "";

  const [topic, setTopic] = useState(previousSourceType === "topic" ? previousSourceText : "");

  const [difficulty, setDifficulty] = useState(location.state?.difficulty || "easy");

  const [count, setCount] = useState(location.state?.question_count || 3);

  const [file, setFile] = useState(null);

  const [language, setLanguage] = useState("english");



  const [extractedContent, setExtractedContent] =
    useState(
      previousSourceType === "pdf" ||
      previousSourceType === "image"
        ? previousSourceText
        : ""
    );


  const [extracting, setExtracting] = useState(false);
  const [sourceType, setSourceType] = useState(previousSourceType);

  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const load = async () => {
      const defaultLanguage = await fetchOcrLanguages(schoolSlug);
      setLanguage(defaultLanguage);
    };

    load();
  }, [schoolSlug]);


  const handleExtract = async () => {
    if (!file) {
      setError("Please select a PDF or image file.");
      return;
    }

    try {

      setExtracting(true);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const res = await API.post(
        `/api/teacher/${schoolSlug}/ai/extract`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setExtractedContent(res.data.content || "");
      setSourceType(res.data.source_type)
      setWordCount(res.data.word_count || 0);
      setCharacterCount(res.data.character_count || 0);

    } catch (err) {
      console.error(err);
      setError("Failed to extract content.");
    } finally {
      setExtracting(false);
    }
  };

  // auto scroll to extracted section
  useEffect(() => {
    if (
      extractedContent &&
      (sourceType === "pdf" || sourceType === "image")
    ) {
      extractRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [extractedContent, sourceType]);

  const handleGenerate = async () => {
    const hasTopic = topic.trim().length > 0;
    const hasFile = file !== null;
    const hasContent = extractedContent.trim().length > 0;

    if (!hasTopic && !hasFile && !hasContent) {
      setError("Please enter a topic or upload a file.");
      return;
    }

    if (hasTopic && (hasFile || hasContent)) {
      setError("Please use either Topic or File, not both.");
      return;
    }

    if (hasFile && !hasContent) {
      setError(
        "Please extract and review the content before generating questions."
      );
      return;
    }

    try {
 
      setLoading(true);
      setError("");


      const formData = new FormData(); 
      


      if (hasTopic) {
        formData.append("topic", topic);
      }

      if (hasContent) {
      formData.append("content", extractedContent);
      formData.append("source_type", sourceType);
    }

      formData.append("difficulty", difficulty);
      formData.append("question_count", count);
      formData.append("language", language);

      const res = await API.post(
        `/api/teacher/${schoolSlug}/ai/generate`,
        formData,
        
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Generate Response:", res.data);

      const requestId = res.data.request_id;

      if (!res.data.success || !res.data.request_id) {
          setError(res.data.message || "Failed to generate questions.");
          return;
        }
     

      navigate(
        `/school/${schoolSlug}/teacher/ai/preview/${requestId}`
      );
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to generate questions."
      );
    } finally {
 
      setLoading(false);
    }
  };

  return (
    <>

      {(loading  && (
        <LoadingOverlay message="Generating AI Questions..." />
      )) || (extracting && (
        <LoadingOverlay message="Extracting Content..." />
      ))}
    <div className="max-w-5xl mx-auto">
      
      {/* HEADER */}
        <PageHeader
          title="AI Question Generator"
          description="Generate multiple-choice questions from a topic or from your teaching material."
          actions={
            fromHistory ? (
              <BackButton to={-1} label="Back to History" />
            ) : null
          }
        />
      {/* Topic Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5">

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <PenSquare className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Generate from Topic
            </h2>

            <p className="text-sm text-gray-500">
              Enter a topic and let AI generate questions instantly.
            </p>
          </div>
        </div>

        <input
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: Photosynthesis"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-5">
        <div className="flex-1 h-px bg-slate-200" />

        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          OR
        </span>

        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* File Section */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>

            <div>

              <h2 className="font-semibold text-lg">
                Generate from PDF or Image
              </h2>

              <p className="text-sm text-gray-500">
                Upload teaching material and generate questions using AI.
              </p>
              <p className="text-sm text-blue-600 mb-4">
                Recommended: PDF files usually provide the most accurate
                results.
              </p>

            </div>

          </div>

        
          <div className="mb-4">

          <div className="flex items-center gap-2 mb-1">

            <Languages className="w-4 h-4 text-indigo-600" />

            <label className="font-medium">
              Document Language
            </label>

          </div>

          <p className="text-xs text-gray-500 mb-2">
            Choose the language used in the uploaded document.
          </p>

          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {ocrLanguages.map((lang) => (
              <option
                key={lang.value}
                value={lang.value}
              >
                {lang.label}
              </option>
            ))}
          </select>

        </div>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center mb-4 hover:border-indigo-400 transition">

          <Upload className="mx-auto w-8 h-8 text-indigo-500 mb-2" />

          <p className="font-medium">
            Upload PDF or Image
          </p>

          <p className="text-sm text-gray-500 mb-4">
            PDF • JPG • PNG
          </p>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setExtractedContent("");
              setSourceType("");
              setWordCount(0);
              setCharacterCount(0);
            }}
            className="mx-auto"
          />

        </div>

        {file && (

          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm mb-4">

          <CheckCircle2 className="w-4 h-4"/>

          <span>{file.name}</span>

          </div>

          )}

        <button
          type="button"
          onClick={handleExtract}
          disabled={!file || extracting}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition"
        >
          {extracting ? "Extracting..." : "Extract Content"}
        </button>
      </div>

      {/* Extracted Content */}
      {extractedContent && (
        
        <div ref={extractRef} className="border rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-lg mb-2">
            Review Extracted Content
          </h2>

          <p className="text-sm text-gray-600 mb-3">
            Please review the extracted content before generating
            questions. For image files, you may need to make small
            corrections before generating questions.
          </p>

          <div className="text-sm text-green-600 mb-3">
            ✓ Content extracted successfully
          </div>

          <div className="text-sm text-gray-500 mb-3">
            Words: {wordCount} • Characters: {characterCount}
          </div>
          <div className="text-green-600 text-sm mb-2">
            ✓ Content ready for review
          </div>
          <textarea
            className="w-full border rounded p-3 h-72"
            value={extractedContent}
            onChange={(e) => setExtractedContent(e.target.value)}
          />
        </div>
      )}

      {/* Question Settings */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-lg mb-4">
          Question Settings
        </h2>

        <div className="mb-4">
          <label className="block mb-1">Difficulty</label>

          <select
            className="w-full border rounded p-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Question Count</label>

          <input
            type="number"
            min="1"
            max="20"
            className="w-full border rounded p-2"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-medium"
      >
        {loading
          ? "Generating..."
          : extractedContent
          ? "Generate Questions"
          : "Generate Questions"}
      </button>
      
    </div>

    </>

    
  );
}