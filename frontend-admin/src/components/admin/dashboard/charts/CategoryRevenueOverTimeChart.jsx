// frontend-admin/src/components/admin/dashboard/charts/CategoryRevenueOverTimeChart.jsx
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import useChartTheme from "../hooks/useChartTheme";
import useChartLegendController from "../hooks/useChartLegendController";
import { useTranslation } from "react-i18next";
import { formatPeriodFrame } from "../../../../utils/formatPeriodFrame";
import PeriodLabel from "../shared/PeriodLabel";
import AnimatedChart from "../shared/AnimatedChart";
import MobileChartLegend from "../shared/MobileChartLegend";
import { formatXAxisByPeriod } from "../../../../utils/charts/formatXAxis";
import { formatYAxis } from "../../../../utils/charts/formatYAxis";
import EmptyState from "../../../ui/EmptyState";

const COLORS = [
  "#94a3b8",
  "#a8a29e",
  "#86efac",
  "#93c5fd",
  "#c4b5fd",
  "#fca5a5",
  "#fcd34d",
  "#a7f3d0",
  "#e9d5ff",
  "#bae6fd",
];

export default function CategoryRevenueOverTimeChart({
  data,
  period,
  periodMeta,
  t,
}) {
  const { i18n } = useTranslation();
  const chartTheme = useChartTheme();

  // -------------------------
  // SAFE DATA
  // -------------------------
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // -------------------------
  // CATEGORIES
  // -------------------------
  const categories = useMemo(() => {
    const set = new Set();

    safeData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "period") {
          set.add(key);
        }
      });
    });

    return Array.from(set);
  }, [safeData]);

  // -------------------------
  // SHARED LEGEND CONTROLLER
  // -------------------------
  const {
    isMobile,
    legendOpen,
    setLegendOpen,
    toggleCategory,
    reset,
    visibleCategories,
    legendItems,
  } = useChartLegendController(categories, COLORS);

  // -------------------------
  // NORMALIZED DATA
  // -------------------------
  const chartData = useMemo(() => {
    return safeData.map((row) => ({
      period: row.period,
      ...categories.reduce((acc, cat) => {
        acc[cat] = row[cat] || 0;
        return acc;
      }, {}),
    }));
  }, [safeData, categories]);

  // -------------------------
  // PERIOD LABEL
  // -------------------------
  const periodText = formatPeriodFrame({
    period,
    periodMeta,
    i18n,
    t,
  });

  // -------------------------
  // FORMATTERS
  // -------------------------
  const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="min-h-[360px] flex flex-col">
      {/* TITLE */}
      <h3 className="font-bold text-gray-900 dark:text-white">
        {t("dashboard.charts.categoryRevenueOverTime")}
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
        {!chartData.length ? (
          <div className="h-[300px] flex items-center justify-center">
            <EmptyState title={t("dashboard.noData")} />
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={isMobile ? 260 : 300}
            debounce={50}
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                bottom: 17,
                left: 10,
                right: 10,
              }}
            >
              <XAxis
                dataKey="period"
                stroke={chartTheme.axisColor}
                tick={{
                  fill: chartTheme.textColor,
                  fontSize: 12,
                }}
                tickFormatter={formatXAxisByPeriod(period, i18n)}
              />

              <YAxis
                stroke={chartTheme.axisColor}
                tick={{
                  fill: chartTheme.textColor,
                  fontSize: 12,
                }}
                tickFormatter={formatYAxis("currency")}
              />

              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value),
                  isMobile ? t("dashboard.value") : name,
                ]}
                contentStyle={chartTheme.tooltipStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
                cursor={false}
              />

              {!isMobile && (
                <Legend
                  verticalAlign="top"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    position: "absolute",
                    top: -8,
                    left: 0,
                    right: 0,
                    pointerEvents: "none",
                  }}
                />
              )}

              {visibleCategories.map((cat) => (
                <Line
                  key={cat}
                  type="linear"
                  dataKey={cat}
                  stroke={
                    COLORS[
                      categories.findIndex((c) => c === cat) % COLORS.length
                    ]
                  }
                  strokeWidth={2}
                  dot={{ r: isMobile ? 0 : 1.5 }}
                  activeDot={{ r: 5 }}
                  {...chartTheme.animation}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </AnimatedChart>
    </div>
  );
}


