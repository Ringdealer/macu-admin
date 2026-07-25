import { HiArrowUp, HiArrowDown } from "react-icons/hi";
import KpiCard from "./KpiCard";

export default function RevenueKpi({ analytics, t }) {
  const formattedRevenue = `$${analytics.totalRevenue.toFixed(2)}`;

  return (
    <KpiCard
      title={t("dashboard.kpi.totalRevenue")}
      value={formattedRevenue}
      icon={
        analytics.revenueTrendUp ? (
          <HiArrowUp className="text-green-500" />
        ) : (
          <HiArrowDown className="text-red-500" />
        )
      }
      color="green"
      subtitle={`${analytics.revenueChangePct.toFixed(1)}% ${t(
        "dashboard.analytics.vs24h",
      )}`}
    />
  );
}
