export default function EmptyState({ title = "No data", description }) {
  return (
    <div className="text-center py-10 text-gray-500">
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}