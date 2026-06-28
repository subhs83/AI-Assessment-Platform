import { Trophy} from "lucide-react";
import Counter from "../../common/Counter"

export default function PerformanceSummary({ result }) {
  return (
    <div className="mt-6 bg-white rounded-3xl border shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <h2 className="text-xl font-bold text-slate-900">
        Performance Summary
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        A quick overview of your exam performance.
      </p>

      {/* Progress */}
      {/* <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-700">
            Accuracy
          </span>

          <span className="font-semibold text-slate-900">
            {result.percentage}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-700"
            style={{
              width: `${result.percentage}%`,
            }}
          />
        </div>
      </div> */}

    {/* Metrics */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

  {/* Correct */}
  <div className="bg-white border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-sm transition">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 font-medium">
        Correct
      </span>

      <span className="text-lg font-bold text-green-600">
        <Counter end={result.correct} />
      </span>
    </div>

    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500 rounded-full"
        style={{
          width: `${(result.correct / result.total_questions) * 100}%`,
        }}
      />
    </div>

  </div>

  {/* Wrong */}
  <div className="bg-white border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-sm transition">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 font-medium">
        Wrong
      </span>

      <span className="text-lg font-bold text-red-600">
        <Counter end={result.wrong} />
        
      </span>
    </div>

    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-red-500 rounded-full"
        style={{
          width: `${(result.wrong / result.total_questions) * 100}%`,
        }}
      />
    </div>

  </div>

  {/* Not Attempted */}
  <div className="bg-white border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-sm transition">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 font-medium">
        Not Attempted
      </span>

      <span className="text-lg font-bold text-amber-600">
         <Counter end={result.not_attempted} />
         
      </span>
    </div>

    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full"
        style={{
          width: `${(result.not_attempted / result.total_questions) * 100}%`,
        }}
      />
    </div>

  </div>

  {/* Total */}
  <div className="bg-white border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-sm transition">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 font-medium">
        Total Questions
      </span>

      <span className="text-lg font-bold text-indigo-600">
        {result.total_questions}
      </span>
    </div>

    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-500 rounded-full"
        style={{ width: "100%" }}
      />
    </div>

  </div>

</div>

      {/* Percentile */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3 ">

        {/* Icon */}
        <div className="flex items-center gap-3">

            <div className="bg-indigo-100 p-2.5 rounded-full">
            <Trophy className="text-indigo-600 w-5 h-5" />
            </div>

            <div>
            <p className="text-xs text-slate-500">
                Performance Ranking
            </p>

            <p className="text-sm font-semibold text-slate-800">
                Better than{" "}
                <span className="text-indigo-600 font-bold">
                {result.percentile}%
                </span>{" "}
                of participants
            </p>
            </div>

        </div>

        {/* Right side mini badge */}
        <div className="text-right">
            <p className="text-xs text-slate-500">Rank Impact</p>
            <p className="text-sm font-bold text-indigo-600">
            Top {Math.max(100 - result.percentile, 0)}%
            </p>
        </div>

        </div>

    </div>
  );
}