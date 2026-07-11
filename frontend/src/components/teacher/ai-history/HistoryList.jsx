import HistoryCard from "./HistoryCard";

export default function HistoryList({
  data,
  onView,
  onGenerateAgain,
}) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          onView={onView}
          onGenerateAgain={onGenerateAgain}
        />
      ))}
    </div>
  );
}