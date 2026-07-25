// src/components/ui/ChartSkeleton.jsx

import Skeleton from "./Skeleton";

export default function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
      <Skeleton className="h-6 w-48 mb-6" />

      <div className="space-y-3">
        <Skeleton className="h-64 w-full" />

        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}