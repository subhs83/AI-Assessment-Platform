import {
  Eye,
  RefreshCw,
} from "lucide-react";

import Button from "../../ui/Button";

export default function HistoryCardActions({
  item,
  onView,
  onGenerateAgain,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
      <Button
        variant="info"
        onClick={() => onView(item.id)}
      >
        <Eye size={16} />
        View Questions
      </Button>

      <Button
        variant="success"
        onClick={() => onGenerateAgain(item)}
      >
        <RefreshCw size={16} />
        Generate Again
      </Button>

    </div>
  );
}