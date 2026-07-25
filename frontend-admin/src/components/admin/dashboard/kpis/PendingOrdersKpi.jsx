import { HiExclamation } from "react-icons/hi";
import KpiCard from "./KpiCard";

export default function PendingOrdersKpi({ analytics, t }) {
  return (
    <KpiCard
      title={t("dashboard.kpi.pending")}
      value={analytics.pendingOrders}
      icon={<HiExclamation className="text-red-500" />}
      color="red"
      subtitle={t("dashboard.alert.activeThreshold")}
    />
  );
}
