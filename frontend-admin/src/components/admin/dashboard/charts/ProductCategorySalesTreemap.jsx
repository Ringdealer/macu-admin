// frontend-admin/src/components/admin/dashboard/charts/ProductCategorySalesTreemap.jsx
import { useState } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import useChartTheme from "../hooks/useChartTheme";
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

export default function ProductCategorySalesTreemap({ data = [], t }) {
  const chartTheme = useChartTheme();

  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const formatted = [...data]
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      name: item.category,
      size: item.value,
      fill: COLORS[index % COLORS.length],
    }));

  if (!formatted.length) {
    return (
      <div className="h-[260px] w-full flex items-center justify-center">
        <EmptyState title={t("dashboard.noData")} />
      </div>
    );
  }
  // --------------------------------------------------
  // Custom Treemap Node
  // --------------------------------------------------
function CustomNode(props) {
    const { x, y, width, height, index, name, fill } = props;

    const isLargest = index === 0;
    const active = hovered === name;

    return (
      <g
        onMouseEnter={() => setHovered(name)}
        onMouseLeave={() => setHovered(null)}
        style={{
          cursor: "pointer",
        }}
      >
        <rect
          x={active ? x - 2 : x}
          y={active ? y - 2 : y}
          width={active ? width + 4 : width}
          height={active ? height + 4 : height}
          rx={4}
          ry={4}
          fill={fill}
          stroke={
            active
              ? chartTheme.isDark
                ? "#f9fafb"
                : "#111827"
              : isLargest
                ? chartTheme.isDark
                  ? "#f9fafb"
                  : "#111827"
                : "#ffffff"
          }
          strokeWidth={active ? 3 : isLargest ? 3 : 1}
          style={{
            transition: "all 180ms ease",
            filter: active ? "brightness(1.08)" : "brightness(1)",
          }}
        />

        {width > 70 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            stroke="none"
            strokeWidth={0}
            style={{
              fill: chartTheme.isDark ? "#f3f4f6" : "#374151",
              fontWeight: active ? 700 : 500,
              fontSize: Math.min(width / 8, 15),
              pointerEvents: "none",
              userSelect: "none",
              transition: "all .18s ease",
              shapeRendering: "geometricPrecision",
            }}
          >
            {name}
          </text>
        )}
      </g>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={formatted}
          dataKey="size"
          ratio={4 / 3}
          stroke="#ffffff"
          content={<CustomNode />}
        >
          <Tooltip
            cursor={false}
            contentStyle={chartTheme.tooltipStyle}
            labelStyle={chartTheme.tooltipLabelStyle}
            itemStyle={chartTheme.tooltipItemStyle}
            formatter={(value, name) => [
  `${value} ${t("dashboard.unitsSold")} (${((value / total) * 100).toFixed(1)}%)`,
  `${t("dashboard.subcategory")}: ${name}`,
]}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}


