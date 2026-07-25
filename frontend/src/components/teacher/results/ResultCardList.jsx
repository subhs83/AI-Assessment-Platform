import ResultCard from "./ResultCard";

export default function ResultCardList({
  results,
  examUid,
  routes,
}) {
  return (
    <div className="space-y-3">
      {results.map((result) => (
        <ResultCard
          key={result.id}
          result={result}
          examUid={examUid}
          routes={routes}
        />
      ))}
    </div>
  );
}