import { HiArrowUp, HiArrowDown } from "react-icons/hi";
import KpiCard from "./KpiCard";

export default function TotalOrdersKpi({ analytics, t }) {
  return (
    <KpiCard
      title={t("dashboard.kpi.totalOrders")}
      value={analytics.totalOrders}
      icon={
        analytics.ordersTrendUp ? (
          <HiArrowUp className="text-green-500" />
        ) : (
          <HiArrowDown className="text-red-500" />
        )
      }
      color="blue"
      subtitle={`${analytics.ordersChangePct.toFixed(1)}% ${t(
        "dashboard.analytics.vs24h",
      )}`}
    />
  );
}
