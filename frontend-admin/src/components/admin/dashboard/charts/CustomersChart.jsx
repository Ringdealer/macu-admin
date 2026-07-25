// frontend-admin/src/components/admin/dashboard/charts/CustomersChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatPeriodFrame } from "../../../../utils/formatPeriodFrame";
import { formatXAxisByPeriod } from "../../../../utils/charts/formatXAxis";
import { formatYAxis } from "../../../../utils/charts/formatYAxis";
import useChartTheme from "../hooks/useChartTheme";
import PeriodLabel from "../shared/PeriodLabel";
import AnimatedChart from "../shared/AnimatedChart";
import EmptyState from "../../../ui/EmptyState";


export default function CustomersChart({ data = [], period, periodMeta, t }) {
  const { i18n } = useTranslation();
  const chartTheme = useChartTheme();
  const periodLabel = formatPeriodFrame({
    period,
    periodMeta,
    i18n,
    t,
  });

  const formatTooltip = (value) => [
    `${value} customers`,
    t("dashboard.charts.newCustomers"),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow dark:shadow-black/30 transition-colors">
      <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
        {t("dashboard.charts.newCustomers")}
      </h3>

      {periodLabel && <PeriodLabel label={periodLabel} />}
      <AnimatedChart trigger={periodLabel}>
        {!data.length ? (
          <div className="h-[260px] flex items-center justify-center">
            <EmptyState title={t("dashboard.noData")} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260} debounce={50}>
            <LineChart data={data}>
              <XAxis
                dataKey="period"
                stroke={chartTheme.axisColor}
                tick={chartTheme.axisTick}
                tickFormatter={formatXAxisByPeriod(period, i18n)}
              />

              <YAxis
                stroke={chartTheme.axisColor}
                tick={chartTheme.axisTick}
                tickFormatter={formatYAxis("integer")}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={chartTheme.tooltipStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                formatter={formatTooltip}
              />

              <Line
                type="monotone"
                dataKey="customers"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                activeDot={{ r: 6 }}
                {...chartTheme.animation}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </AnimatedChart>
    </div>
  );
}


