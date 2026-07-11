export default function AIQuestionSettings({
  difficulty,
  setDifficulty,
  count,
  setCount,
}) {
  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">
        Question Settings
      </h2>

      <div className="mb-4">
        <label className="block mb-1">
          Difficulty
        </label>

        <select
          className="w-full border rounded p-2"
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value)
          }
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">
          Question Count
        </label>

        <input
          type="number"
          min="1"
          max="20"
          className="w-full border rounded p-2"
          value={count}
          onChange={(e) =>
            setCount(e.target.value)
          }
        />
      </div>
    </div>
  );
}