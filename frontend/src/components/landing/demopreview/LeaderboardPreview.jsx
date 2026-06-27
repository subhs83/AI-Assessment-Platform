import {
Trophy,
TrendingUp,
Users,
Medal
} from "lucide-react";

export default function LeaderboardPreview() {
return ( <div
   className="
     bg-white
     rounded-3xl
     border
     shadow-lg
     overflow-hidden
     hover:shadow-2xl
    transition-all
    duration-300
   "
 >
  {/* Header */}

  <div className="border-b px-6 py-5">

    <div className="flex items-center justify-between">

      <div>

        <h3 className="font-bold text-xl text-gray-900">
          Leaderboard
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Science Mid Term Examination
        </p>

      </div>

      <Trophy className="text-yellow-500" />

    </div>

  </div>

  <div className="p-6 space-y-5">

    {/* Summary */}

    <div className="grid grid-cols-3 gap-3">

      <div className="bg-blue-50 rounded-2xl p-4">

        <Users
          size={18}
          className="text-blue-600 mb-2"
        />

        <div className="text-sm text-gray-500">
          Students
        </div>

        <div className="font-bold text-xl mt-1">
          320
        </div>

      </div>

      <div className="bg-yellow-50 rounded-2xl p-4">

        <Trophy
          size={18}
          className="text-yellow-600 mb-2"
        />

        <div className="text-sm text-gray-500">
          Top Score
        </div>

        <div className="font-bold text-xl mt-1">
          98%
        </div>

      </div>

      <div className="bg-green-50 rounded-2xl p-4">

        <TrendingUp
          size={18}
          className="text-green-600 mb-2"
        />

        <div className="text-sm text-gray-500">
          Average
        </div>

        <div className="font-bold text-xl mt-1">
          81%
        </div>

      </div>

    </div>

    {/* Top Students */}

    <div className="space-y-3">

      <div
        className="
          bg-yellow-50
          border
          border-yellow-200
          rounded-2xl
          p-4
          flex
          items-center
          justify-between
        "
      >

        <div className="flex items-center gap-3">

          <Trophy
            className="text-yellow-600"
            size={22}
          />

          <div>

            <div className="font-semibold">
              Riya Sharma
            </div>

            <div className="text-sm text-gray-500">
              Rank #1
            </div>

          </div>

        </div>

        <div className="font-bold text-yellow-700 text-xl">
          98%
        </div>

      </div>

      <div
        className="
          border
          rounded-2xl
          p-4
          flex
          items-center
          justify-between
        "
      >

        <div className="flex items-center gap-3">

          <Medal
            className="text-gray-500"
            size={22}
          />

          <div>

            <div className="font-semibold">
              Aman Verma
            </div>

            <div className="text-sm text-gray-500">
              Rank #2
            </div>

          </div>

        </div>

        <div className="font-bold text-gray-700">
          95%
        </div>

      </div>

      <div
        className="
          border
          rounded-2xl
          p-4
          flex
          items-center
          justify-between
        "
      >

        <div className="flex items-center gap-3">

          <Medal
            className="text-orange-500"
            size={22}
          />

          <div>

            <div className="font-semibold">
              Priya Singh
            </div>

            <div className="text-sm text-gray-500">
              Rank #3
            </div>

          </div>

        </div>

        <div className="font-bold text-gray-700">
          93%
        </div>

      </div>

    </div>

  </div>

</div>
);
}
