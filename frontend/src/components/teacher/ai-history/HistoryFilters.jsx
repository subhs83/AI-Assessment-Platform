import { Search, SlidersHorizontal } from "lucide-react";

export default function HistoryFilters({
  search,
  setSearch,
  difficulty,
  setDifficulty,
  status,
  setStatus,
  sourceType,
  setSourceType,
  setPage,
  onClear
}) {
  return (
    <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">

      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={18} />

        <h3 className="font-medium text-gray-700">
          Filters
        </h3>
      </div>


      <div className="flex flex-col xl:flex-row gap-3">


        {/* Search */}
        <div className="relative flex-1">

          <Search
            size={16}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            className="w-full border rounded-lg pl-9 pr-3 py-2"
            placeholder="Search topic or content..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

        </div>



        {/* Source */}
        <select
          className="border rounded-lg px-3 py-2"
          value={sourceType}
          onChange={(e) => {
            setPage(1);
            setSourceType(e.target.value);
          }}
        >

          <option value="">
            All Sources
          </option>

          <option value="topic">
            Topic
          </option>

          <option value="text">
            Text
          </option>

          <option value="pdf">
            PDF
          </option>

          <option value="image">
            Image
          </option>

        </select>



        {/* Difficulty */}
        <select
          className="border rounded-lg px-3 py-2"
          value={difficulty}
          onChange={(e) => {
            setPage(1);
            setDifficulty(e.target.value);
          }}
        >
          
          <option value="">
            All Difficulty
          </option>

          <option value="easy">
            Easy
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="hard">
            Hard
          </option>

        </select>



        {/* Status */}
        <select
          className="border rounded-lg px-3 py-2"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >

          <option value="">
            All Status
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="failed">
            Failed
          </option>

        </select>

        <button
            type="button"
            onClick={onClear}
            className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            Clear
          </button>



      </div>

    </div>
  );
}