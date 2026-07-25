// frontend-admin/src/components/admin/dashboard/charts/CategoryPerformanceChart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useChartTheme from "../hooks/useChartTheme";
import useChartLegendController from "../hooks/useChartLegendController";
import { formatPeriodFrame } from "../../../../utils/formatPeriodFrame";
import PeriodLabel from "../shared/PeriodLabel";
import AnimatedChart from "../shared/AnimatedChart";
import MobileChartLegend from "../shared/MobileChartLegend";
import EmptyState from "../../../ui/EmptyState";

const COLORS = [
  "#94a3b8",
  "#a8a29e",
  "#93c5fd",
  "#86efac",
  "#fcd34d",
  "#c4b5fd",
  "#fca5a5",
  "#a7f3d0",
  "#bae6fd",
  "#e9d5ff",
];

export default function CategoryPerformanceChart({
  data = [],
  periodMeta,
  period,
  t,
}) {
  const { i18n } = useTranslation();
  const chartTheme = useChartTheme();
  const periodText = formatPeriodFrame({
    period,
    periodMeta,
    i18n,
    t,
  });

  // -------------------------
  // CHART DATA
  // -------------------------
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        category: item.category,
        revenue: item.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [data]);

  const categories = useMemo(
    () => chartData.map((item) => item.category),
    [chartData],
  );

  const {
    isMobile,
    legendOpen,
    setLegendOpen,
    toggleCategory,
    reset,
    visibleCategories,
    legendItems,
  } = useChartLegendController(categories, COLORS);

  const visibleData = useMemo(
    () => chartData.filter((item) => visibleCategories.includes(item.category)),
    [chartData, visibleCategories],
  );

  const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const formatCompactCurrency = (value) => {
    const num = Number(value || 0);

    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;

    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="min-h-[360px] flex flex-col">
      {/* TITLE */}
      <h3 className="font-bold text-gray-900 dark:text-white">
        {t("dashboard.charts.revenueByCategory")}
      </h3>

      {/* PERIOD */}
      {periodText && <PeriodLabel label={periodText} />}

      {/* MOBILE LEGEND */}
      <MobileChartLegend
        t={t}
        isMobile={isMobile}
        legendOpen={legendOpen}
        setLegendOpen={setLegendOpen}
        legendItems={legendItems}
        toggleCategory={toggleCategory}
        reset={reset}
      />

      {/* CHART */}
      <AnimatedChart trigger={periodText}>
        {!visibleData.length ? (
          <div className="h-[300px] flex items-center justify-center">
            <EmptyState title={t("dashboard.noData")} />
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={isMobile ? 260 : 300}
            debounce={50}
          >
            <BarChart
              data={visibleData}
              layout="horizontal"
              margin={{
                top: 20,
                right: 20,
                left: isMobile ? 10 : 20,
                bottom: isMobile ? 40 : 20,
              }}
            >
              <XAxis
                dataKey="category"
                stroke={chartTheme.axisColor}
                interval={0}
                tick={
                  isMobile
                    ? false
                    : {
                        fill: chartTheme.textColor,
                        fontSize: 12,
                      }
                }
              />

              <YAxis
                stroke={chartTheme.axisColor}
                tick={{
                  fill: chartTheme.textColor,
                  fontSize: 12,
                }}
                tickFormatter={formatCompactCurrency}
              />

              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") {
                    return [formatCurrency(value), t("dashboard.revenue")];
                  }

                  return [value, t("dashboard.category")];
                }}
                labelFormatter={(label) =>
                  `${t("dashboard.category")}: ${label}`
                }
                contentStyle={chartTheme.tooltipStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
                cursor={false}
              />

              <Bar
                dataKey="revenue"
                radius={[6, 6, 0, 0]}
                barSize={isMobile ? 14 : 24}
                activeBar={{
                  stroke: "#475569",
                  strokeWidth: 2,
                }}
                {...chartTheme.animation}
              >
                {visibleData.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}

                {!isMobile && (
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    formatter={formatCompactCurrency}
                    style={{
                      fill: chartTheme.textColor,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnimatedChart>
    </div>
  );
}


