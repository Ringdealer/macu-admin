// frontend-admin/src/components/admin/dashboard/charts/OrdersTrendChart.jsx
/**
 * OrdersTrendChart
 *
 * Global period comes from DashboardHeader.
 * Local controls only switch visualization.
 */
import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPeriodFrame } from "../../../../utils/formatPeriodFrame";
import { useTranslation } from "react-i18next";
import { formatXAxisByPeriod } from "../../../../utils/charts/formatXAxis";
import { formatYAxis } from "../../../../utils/charts/formatYAxis";
import useChartTheme from "../hooks/useChartTheme";
import PeriodLabel from "../shared/PeriodLabel";
import AnimatedChart from "../shared/AnimatedChart";
import EmptyState from "../../../ui/EmptyState";

export default function OrdersTrendChart({ data = [], period, periodMeta, t }) {
  const { i18n } = useTranslation();
  const chartTheme = useChartTheme();
  const [view, setView] = useState("combined");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

const periodLabel = useMemo(
  () =>
    formatPeriodFrame({
      period,
      periodMeta,
      i18n,
      t,
    }),
  [period, periodMeta, i18n.language, t]
);

  // -------------------------
  // FORMAT X AXIS
  // -------------------------
  const chartData = data;

  const renderChart = (type) => {
    const isOrders = type === "orders";

    const dataKey = isOrders ? "orders" : "revenue";

    const stroke = isOrders ? "#3b82f6" : "#10b981";

    const Chart = isOrders ? LineChart : AreaChart;

    return (
      <AnimatedChart trigger={periodLabel}>
        <ResponsiveContainer
          width="100%"
          height={isMobile ? 220 : 260}
          debounce={50}
        >
          <Chart data={chartData}>
            <defs>
              <linearGradient
                id={`gradient-${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={stroke} stopOpacity={0.5} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={false} />

            <XAxis
              dataKey="period"
              stroke={chartTheme.axisColor}
              tick={chartTheme.axisTick}
              tickFormatter={formatXAxisByPeriod(period, i18n)}
            />

            <YAxis
              stroke="#9ca3af"
              allowDecimals={false}
              tickFormatter={
                isOrders ? formatYAxis("integer") : formatYAxis("currency")
              }
            />

            <Tooltip
              contentStyle={chartTheme.tooltipStyle}
              labelStyle={chartTheme.tooltipLabelStyle}
              itemStyle={chartTheme.tooltipItemStyle}
              wrapperStyle={{ fontSize: isMobile ? 12 : 13 }}
              cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
            />

            {isOrders ? (
              <Line
                type="linear"
                dataKey={dataKey}
                stroke={stroke}
                strokeWidth={3}
                dot={{
                  r: isMobile ? 3 : 2.5,
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                activeDot={{ r: isMobile ? 7 : 6 }}
                {...chartTheme.animation}
              />
            ) : (
              <Area
                type="linear"
                dataKey={dataKey}
                stroke={stroke}
                fill={`url(#gradient-${dataKey})`}
                strokeWidth={3}
                dot={{
                  r: 2.5,
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            )}
          </Chart>
        </ResponsiveContainer>
      </AnimatedChart>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-4 transition-colors">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            {t("dashboard.charts.ordersTrend")}
          </h3>

          {periodLabel && <PeriodLabel label={periodLabel} />}
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setView("orders")}
            className={`px-2 py-1 rounded transition ${
              view === "orders"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {t("dashboard.analytics.orders")}
          </button>

          <button
            onClick={() => setView("revenue")}
            className={`px-2 py-1 rounded transition ${
              view === "revenue"
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {t("dashboard.analytics.revenue")}
          </button>

          <button
            onClick={() => setView("combined")}
            className={`px-2 py-1 rounded transition ${
              view === "combined"
                ? "bg-gray-900 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {t("dashboard.analytics.all")}
          </button>
        </div>
      </div>

      {view === "orders" && renderChart("orders")}

      {view === "revenue" && renderChart("revenue")}

      {view === "combined" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("dashboard.analytics.orders")}
            </p>

            {chartData.length ? (
              renderChart("orders")
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <EmptyState title={t("dashboard.noData")} />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("dashboard.analytics.revenue")}
            </p>

            {chartData.length ? (
              renderChart("revenue")
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <EmptyState title={t("dashboard.noData")} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


