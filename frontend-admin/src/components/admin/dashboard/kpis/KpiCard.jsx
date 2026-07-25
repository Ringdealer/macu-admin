export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}) {
  const styles = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    red: "from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300",
    green:
      "from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
  };

  return (
    <div
      className={`bg-gradient-to-br ${styles[color]} p-6 rounded-xl shadow border transition`}
    >
      <div className="flex justify-between items-center">
        <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
        {icon}
      </div>

      <h2 className="text-3xl font-bold mt-2">{value}</h2>

      {subtitle && (
        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
