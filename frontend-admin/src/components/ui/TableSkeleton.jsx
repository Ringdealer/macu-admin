export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="
                  h-5
                  rounded
                  bg-gray-200
                  dark:bg-gray-700
                  animate-pulse
                "
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
