import { Sparkles } from "lucide-react";

import Button from "../../ui/Button";

export default function HistoryEmptyState({
  onGenerate,
}) {
  return (
    <div className="bg-white border rounded-xl p-10 text-center">

      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
          <Sparkles size={28} />
        </div>
      </div>


      <h3 className="font-semibold text-lg text-gray-800">
        No AI Questions Generated Yet
      </h3>


      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
        Create your first AI-powered question set using
        topic, text, PDF, or image generation.
      </p>


      <div className="mt-5">

        <Button
          variant="primary"
          onClick={onGenerate}
        >
          <Sparkles size={16}/>
          Generate Questions
        </Button>

      </div>


    </div>
  );
}