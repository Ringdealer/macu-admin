import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useChartTheme from "../hooks/useChartTheme";
import useChartLegendController from "../hooks/useChartLegendController";
import EmptyState from "../../../ui/EmptyState";

export default function OrderStatusPieChart({ data = [], t }) {
  const chartTheme = useChartTheme();
  const { isMobile } = useChartLegendController();

  const STATUS_COLORS = {
    cancelled: "#ef4444",
    returned: "#f59e0b",
    delivered: "#10b981",
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow dark:shadow-black/30 transition-colors">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
          {t("dashboard.charts.orderStatus")}
        </h3>

        <div className="h-[240px] flex items-center justify-center">
          <EmptyState title={t("dashboard.noData")} />
        </div>
      </div>
    );
  }

  const statusLabel = (key) => t(`orders.status.${key}`);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow dark:shadow-black/30 transition-colors">
      <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
        {t("dashboard.charts.orderStatus")}
      </h3>

      <div className="h-[240px] flex">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                innerRadius="55%"
                outerRadius="82%"
                paddingAngle={2}
                cornerRadius={6}
                labelLine={false}
                {...chartTheme.animation}
                label={
                  isMobile
                    ? false
                    : ({ percent }) =>
                        percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                }
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={STATUS_COLORS[entry.key] ?? chartTheme.axisColor}
                    stroke={chartTheme.tooltipBg}
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  statusLabel(name),
                ]}
                contentStyle={chartTheme.tooltipStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
              />

              {!isMobile && (
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  formatter={(value) => statusLabel(value)}
                  wrapperStyle={{
                    color: chartTheme.textColor,
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


