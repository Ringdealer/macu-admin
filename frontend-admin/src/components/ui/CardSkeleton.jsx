export default function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse">
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6" />

      <div className="space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}