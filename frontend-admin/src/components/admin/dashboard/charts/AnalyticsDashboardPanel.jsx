// frontend-admin/src/components/admin/dashboard/charts/AnalyticsDashboardPanel.jsx
import { memo } from "react";
import CategoryPerformanceChart from "./CategoryPerformanceChart";
import CategoryRevenueOverTimeChart from "./CategoryRevenueOverTimeChart";

function CategoryAnalyticsPanel({ analyticsData, period, t }) {
  const viewMode = "both";
  const categoryPerformance = analyticsData?.category_performance ?? [];
  const categoryRevenueOverTime =
    analyticsData?.category_revenue_over_time ?? [];
  const periodMeta = analyticsData?.period_meta;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-4 transition-colors">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">
          {t("dashboard.categoryAnalytics")}
        </h3>
      </div>

      {/* CHART GRID */}
      <div
        className={`grid gap-6 ${
          viewMode === "both" ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* CATEGORY PERFORMANCE */}
        {(viewMode === "bar" || viewMode === "both") && (
          <CategoryPerformanceChart
            data={categoryPerformance}
            period={period}
            periodMeta={periodMeta}
            t={t}
          />
        )}

        {/* CATEGORY REVENUE OVER TIME */}
        {(viewMode === "stacked" || viewMode === "both") && (
          <CategoryRevenueOverTimeChart
            data={categoryRevenueOverTime}
            period={period}
            periodMeta={periodMeta}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

export default memo(CategoryAnalyticsPanel);
