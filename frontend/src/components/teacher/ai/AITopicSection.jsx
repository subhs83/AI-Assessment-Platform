import { PenSquare } from "lucide-react";

export default function AITopicSection({
  topic,
  setTopic,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 m-5">

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
  );
}