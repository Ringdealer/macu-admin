import Skeleton from "../../../ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
          >
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* REVENUE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
          >
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
          >
            <Skeleton className="h-5 w-40 mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>

      {/* LOWER CHARTS */}
      {[1, 2].map((item) => (
        <div
          key={item}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
        >
          <Skeleton className="h-5 w-48 mb-6" />
          <Skeleton className="h-72 w-full" />
        </div>
      ))}
    </div>
  );
}
