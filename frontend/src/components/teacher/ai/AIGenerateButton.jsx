import { Sparkles } from "lucide-react";

export default function AIGenerateButton({
  loading,
  onGenerate,
}) {
  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={loading}
      className="
        w-full
        rounded-lg
        bg-indigo-600
        py-3
        font-medium
        text-white
        transition
        hover:bg-indigo-700
        disabled:cursor-not-allowed
        disabled:opacity-60
        flex
        items-center
        justify-center
        gap-2
      "
    >
      <Sparkles size={18} />

      {loading
        ? "Generating Questions..."
        : "Generate Questions"}
    </button>
  );
}