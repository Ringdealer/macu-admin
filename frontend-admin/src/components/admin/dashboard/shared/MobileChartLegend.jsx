export default function MobileChartLegend({
  t,
  isMobile,
  legendOpen,
  setLegendOpen,
  legendItems,
  toggleCategory,
  reset,
}) {
  if (!isMobile) return null;

  return (
    <div className="mb-3 relative">
      <button
        onClick={() => setLegendOpen((v) => !v)}
        className="px-3 py-1 text-xs rounded border bg-white dark:bg-gray-800"
      >
        {t("dashboard.categories")} ▼
      </button>

      {legendOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border rounded-lg shadow p-2">
          <button
            onClick={reset}
            className="w-full text-left text-xs px-2 py-2 mb-2 border-b hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t("dashboard.all")}
          </button>

          <div className="flex flex-col gap-1">
            {legendItems.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleCategory(item.key)}
                className={`flex items-center gap-2 text-xs px-2 py-2 rounded transition ${
                  item.hidden ? "opacity-40" : "opacity-100"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="flex-1 text-left">{item.key}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
