import {
  ArrowLeft,
  Upload,
} from "lucide-react";

import Button from "../../ui/Button";

export default function UploadActions({
  loading,
  onCancel,
  onUpload,
}) {
  return (
    <div className="flex justify-end gap-3">

      <Button
        variant="secondary"
        onClick={onCancel}
      >
        <ArrowLeft size={16} />
        Cancel
      </Button>

      <Button
        variant="primary"
        onClick={onUpload}
        disabled={loading}
      >
        <Upload size={16} />

        {loading
          ? "Uploading..."
          : "Upload File"}
      </Button>

    </div>
  );
}