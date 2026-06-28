import {
  FileText,
  ImageIcon,
  BookOpen,
  ClipboardPaste,
  BarChart3,
  Trophy,
  CheckCircle2
} from "lucide-react";
import Counter from "../../common/Counter";

export default function FeaturePreviewCard() {
  return (
    <div className="relative max-w-5xl mx-auto mt-10 hover:shadow-2xl hover: rounded-[2rem] transition-all duration-300">

      {/* glow */}
      <div className="absolute inset-0 bg-blue-200/20 blur-3xl rounded-full" />

      <div className="relative bg-white border shadow-2xl rounded-[2rem] overflow-hidden">

        {/* top bar */}
        <div className="border-b px-8 py-5 flex items-center gap-3 bg-gray-50">

          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />

          <span className="text-sm text-gray-500 ml-4">
            IndiaEduCore Platform
          </span>

        </div>

        <div className="grid lg:grid-cols-2">

          {/* Left */}
          <div className="p-8 border-r">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium mb-8">
              AI Question Generator
            </div>

            <div className="space-y-5">

              <div className="flex items-center justify-between border rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" />
                  <span>PDF → Questions</span>
                </div>

                <CheckCircle2 className="text-green-600" />
              </div>

              <div className="flex items-center justify-between border rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <ImageIcon className="text-green-600" />
                  <span>Image → Questions</span>
                </div>

                <CheckCircle2 className="text-green-600" />
              </div>

              <div className="flex items-center justify-between border rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <BookOpen className="text-purple-600" />
                    <span>Topic → Questions</span>
                </div>

                <CheckCircle2 className="text-green-600" />
                </div>

                <div className="flex items-center justify-between border rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <ClipboardPaste className="text-orange-600" />
                    <span>Upload Your Own Questions</span>
                </div>

                <CheckCircle2 className="text-green-600" />
                </div>

            </div>

          </div>

          {/* Right */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-white">

            <div className="grid gap-5">

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">

                  <BarChart3 className="text-blue-600" />

                  <span className="font-semibold">
                    Analytics Dashboard
                  </span>

                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">

                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      <Counter
                        end={"96"}
                        suffix="%"
                        enableScrollSpy
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      Accuracy
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      <Counter
                        end={"120"}
                        enableScrollSpy
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      Exams
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      2.4k
                    </div>

                    <div className="text-xs text-gray-500">
                      Attempts
                    </div>
                  </div>

                </div>

              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">

                <div className="flex items-center gap-3 mb-4">

                  <Trophy className="text-yellow-500" />

                  <span className="font-semibold">
                    Leaderboards
                  </span>

                </div>

                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span>🥇 Rahul Sharma</span>
                    <span className="font-bold"><Counter
                        end={"95"}
                        suffix="%"
                        enableScrollSpy
                      /></span>
                  </div>

                  <div className="flex justify-between">
                    <span>🥈 Priya Singh</span>
                    <span className="font-bold"><Counter
                        end={"92"}
                        suffix="%"
                        enableScrollSpy
                      /></span>
                  </div>

                  <div className="flex justify-between">
                    <span>🥉 Aman Kumar</span>
                    <span className="font-bold"><Counter
                        end={"90"}
                        suffix="%"
                        enableScrollSpy
                      /></span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}