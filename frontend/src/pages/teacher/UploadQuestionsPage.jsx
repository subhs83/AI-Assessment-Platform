import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { teacherApi } from "../../api/teacherApi";
import { teacherRoutes } from "../../routes/teacherRoutes";
import { useTeacherStore } from "../../store/teacherStore";
import { useSchoolStore } from "../../store/schoolStore";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";
import  LoadingOverlay  from "../../components/common/LoadingOverlay";
import { downloadFile } from "../../utils/downloadFile";
import {
  ExamSelector,
  TemplateDownloadCard,
  UploadDropzone,
  UploadActions
} from "../../components/teacher/question-upload";


export default function UploadQuestionsPage() {
  const { schoolSlug } = useParams();

  const routes = teacherRoutes(schoolSlug);
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedExam, setSelectedExam] = useState("");

  const [isUploading, setIsUploading] = useState(false);


  const downloadQuestionTemplate =  useTeacherStore((s) => s.downloadQuestionTemplate);

  const examOptions = useSchoolStore((s) => s.examOptions);


  const exams = examOptions?.exams || [];

 
  // -------------------------
  // Download & UPLOAD
  // -------------------------

  const handleDownloadTemplate = async () => {

  try {

    const blob =
      await downloadQuestionTemplate(
        schoolSlug
      );

    downloadFile(
      blob,
      "sample_question_template.xlsx"
    );

  } catch {

    showToast(
      "Failed to download template",
      "error"
    );

  }

};

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
    
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <PageHeader
        title="Upload Questions"
        description="Prepare questions only using the sample Excel template and upload them directly to an exam."
      />

      {/* EXAM SELECT */}
      <ExamSelector
        exams={exams}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
      />
      
      {/* Downloaded section */}
      <TemplateDownloadCard
        onDownload={handleDownloadTemplate}
      />

      {/* UPLOAD BOX */}
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">

        {/* FILE AREA */}
        <UploadDropzone
          file={file}
          setFile={setFile}
        />

        {/* ACTIONS */}
        <UploadActions
          loading={loading}
          onCancel={() =>
            navigate(routes.exams.list)
          }
          onUpload={handleUpload}
        />

      </div>

    </div>
    </>
  );
}