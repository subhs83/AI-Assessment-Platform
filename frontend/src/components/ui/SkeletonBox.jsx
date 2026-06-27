export default function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`bg-gray-200 rounded-md min-h-4 ${className}`}
    />
  );
}