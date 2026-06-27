import SkeletonCard from "../../ui/SkeletonCard";
import SkeletonBox from "../../ui/SkeletonBox";

export default function ResultSkeleton() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <SkeletonCard>
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <SkeletonBox className="h-7 w-56" />
            <SkeletonBox className="h-4 w-40" />
          </div>

          <SkeletonBox className="h-10 w-28 rounded-full" />
        </div>
      </SkeletonCard>

      {/* Hero */}
      <SkeletonCard>
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          <div className="space-y-4">
            <SkeletonBox className="h-6 w-44" />
            <SkeletonBox className="h-4 w-64" />
            <SkeletonBox className="h-4 w-52" />

            <div className="flex gap-3 pt-2">
              <SkeletonBox className="h-9 w-28 rounded-full" />
              <SkeletonBox className="h-9 w-28 rounded-full" />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <SkeletonBox className="w-36 h-36 rounded-full" />
          </div>

        </div>
      </SkeletonCard>

      {/* Performance Summary */}
      <SkeletonCard>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="space-y-3 text-center"
            >
              <SkeletonBox className="h-4 w-20 mx-auto" />
              <SkeletonBox className="h-8 w-12 mx-auto" />
            </div>
          ))}

        </div>
      </SkeletonCard>

      {/* Question Cards */}
      {[1, 2, 3].map((item) => (
        <SkeletonCard key={item}>
          <div className="space-y-4">

            <SkeletonBox className="h-5 w-48" />

            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />

            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4].map((opt) => (
                <SkeletonBox
                  key={opt}
                  className="h-10 w-full"
                />
              ))}
            </div>

          </div>
        </SkeletonCard>
      ))}

    </div>
  );
}