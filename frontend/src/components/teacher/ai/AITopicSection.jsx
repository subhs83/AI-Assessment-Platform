import { PenSquare } from "lucide-react";

export default function AITopicSection({
  topic,
  setTopic,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-xl sm:p-5">

      <div className="mb-3 flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
          <PenSquare className="w-5 h-5 text-indigo-600" />
        </div>

        <div>
          <h2 className="text-base font-semibold sm:text-lg">
            Generate from Topic
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter a topic and let AI generate questions instantly.
          </p>
        </div>

      </div>

      <input
        className="
        w-full
        rounded-xl
        border
        border-slate-300
        px-4
        py-3
        text-sm
        text-slate-800
        outline-none
        transition
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
        "
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Example: Photosynthesis"
      />

    </div>
  );
}