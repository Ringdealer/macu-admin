import { useMemo, useState } from "react";
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
import { Package, GitCompareArrows, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPeriodFrame } from "../../../../utils/formatPeriodFrame";
import PeriodLabel from "../shared/PeriodLabel";
import AnimatedChart from "../shared/AnimatedChart";
import useChartTheme from "../hooks/useChartTheme";
import useChartLegendController from "../hooks/useChartLegendController";
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

export default function TopSellingProductsChart({
  data,
  period,
  periodMeta,
  t,
}) {
  const { i18n } = useTranslation();
  const chartTheme = useChartTheme();
  const { isMobile } = useChartLegendController();
  const { textColor, axisColor } = chartTheme;

  const MODES = [
    {
      key: "current",
      label: t("topProducts.modes.current"),
      icon: Package,
    },
    {
      key: "delta",
      label: t("topProducts.modes.delta"),
      icon: GitCompareArrows,
    },
    {
      key: "percent",
      label: t("topProducts.modes.percent"),
      icon: TrendingUp,
    },
  ];

  const [mode, setMode] = useState("current"); // current | delta | percent

  // -------------------------
  // DATA NORMALIZATION (FIXED)
  // -------------------------
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        const current = item.current_qty ?? item.qty ?? 0;
        const previous = item.previous_qty ?? 0;
        const delta = item.delta ?? 0;
        const percent = item.percent_change;

        return {
          product: item.name,
          current,
          previous,
          delta,
          percent,
          isNew: item.is_new,
          value:
            mode === "current"
              ? current
              : mode === "delta"
                ? delta
                : (percent ?? 0),
        };
      })
      .sort((a, b) => b.current - a.current)
      .slice(0, 10);
  }, [data, mode]);

  const periodLabel = formatPeriodFrame({
    period,
    periodMeta,
    i18n,
    t,
  });

  const formatLabel = (item = {}) => {
    const current = item.current ?? 0;
    const delta = item.delta ?? 0;
    const percent = item.percent;

    switch (mode) {
      case "delta":
        if (item.isNew) return "NEW";
        return delta > 0 ? `+${delta}` : `${delta}`;

      case "percent":
        if (item.isNew) return "NEW";
        if (percent == null) return "—";
        return `${percent.toFixed(1)}%`;

      case "current":
      default:
        return current;
    }
  };

  const getColor = (item) => {
    if (item.isNew) return "#3b82f6";

    if (mode === "delta") {
      return item.delta > 0 ? "#22c55e" : "#ef4444";
    }

    if (mode === "percent") {
      return (item.percent ?? 0) > 0 ? "#22c55e" : "#ef4444";
    }

    return COLORS[0];
  };

  return (
    <div className="h-full">     
      {/* HEADER */}
      <div className="mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white">
          {t("dashboard.charts.topSellingProducts")}
        </h3>

        {/* TOGGLE */}
        <div className={`mt-2 flex ${isMobile ? "flex-wrap gap-1" : "gap-2"}`}>
          {MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center justify-center gap-1 rounded-md transition-colors
          ${isMobile ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}
          ${
            mode === key
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
            >
              <Icon size={isMobile ? 12 : 14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {periodLabel && <PeriodLabel label={periodLabel} />}

      <AnimatedChart trigger={periodLabel}>
        {!chartData.length ? (
          <div className="h-[340px] flex items-center justify-center">
            <EmptyState title={t("dashboard.noData")} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 260 : 340}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: isMobile ? 30 : 15,
                left: isMobile ? 15 : -30,
                bottom: 10,
              }}
            >
              <XAxis
                type="number"
                stroke={axisColor}
                tick={isMobile ? false : { fill: textColor, fontSize: 12 }}
              />

              <YAxis
                type="category"
                dataKey="product"
                stroke={axisColor}
                axisLine
                tickLine={false}
                width={isMobile ? 8 : 120}
                tick={isMobile ? false : { fill: textColor, fontSize: 12 }}
              />

              <Tooltip
                labelFormatter={(label) => label}
                formatter={(value, name, props) => {
                  const item = props?.payload || {};

                  return [
                    formatLabel(item),
                    mode === "current"
                      ? t("dashboard.unitsSold")
                      : mode === "delta"
                        ? "Change"
                        : "Growth %",
                  ];
                }}
                contentStyle={chartTheme.tooltipStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
                cursor={false}
              />

              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                barSize={isMobile ? 16 : 26}
                activeBar={{
                  stroke: "#475569",
                  strokeWidth: 2,
                }}
                {...chartTheme.animation}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.product}
                    fill={
                      mode === "current"
                        ? COLORS[index % COLORS.length]
                        : getColor(entry)
                    }
                  />
                ))}

                <LabelList
                  dataKey="value"
                  position="right"
                  content={({ x, y, width, height, index }) => {
                    const item = chartData[index];

                    if (!item) return null;

                    return (
                      <text
                        x={x + width + 8}
                        y={y + height / 2}
                        fill={textColor}
                        fontSize={isMobile ? 11 : 12}
                        fontWeight={600}
                        textAnchor="start"
                        dominantBaseline="middle"
                      >
                        {formatLabel(item)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnimatedChart>
    </div>
  );
}


