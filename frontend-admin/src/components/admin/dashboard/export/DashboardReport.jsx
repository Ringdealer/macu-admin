import TotalOrdersKpi from "../kpis/TotalOrdersKpi";
import PendingOrdersKpi from "../kpis/PendingOrdersKpi";
import RevenueKpi from "../kpis/RevenueKpi";
import OrdersTrendChart from "../charts/OrdersTrendChart";
import OrderInsightsPanel from "../charts/OrderInsightsPanel";
import TopSellingProductsChart from "../charts/TopSellingProductsChart";
import CategoryAnalyticsPanel from "../charts/AnalyticsDashboardPanel";
import CustomersChart from "../charts/CustomersChart";
import { HiExclamation } from "react-icons/hi";

export default function DashboardReport({
  analytics,
  dashboardAnalytics,
  analyticsPeriod,
  lowStock,
  t,
}) {
  return (
    <div
      id="analytics-report"
      style={{
        position: "absolute",
        left: "-10000px",
        top: 0,
        width: "1560px",
        background: "white",
        padding: "40px",
      }}
    >
      {" "}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
          paddingLeft: 30,
        }}
      >
        {" "}
        {t("dashboard.title")}{" "}
      </h1>{" "}
      {/* ================= PAGE 1 ================= */}
      <div
        className="pdf-page"
        style={{
          width: "1032px",
          height: "1460px",
          padding: "39px",
          boxSizing: "border-box",
          background: "white",
          overflow: "hidden",
        }}
      >
        {" "}
        {/* KPI CARDS */}{" "}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {" "}
          <TotalOrdersKpi analytics={analytics} t={t} />{" "}
          <PendingOrdersKpi analytics={analytics} t={t} />{" "}
          <RevenueKpi analytics={analytics} t={t} />{" "}
        </div>{" "}
        {/* OPERATIONAL CHARTS */}{" "}
        <div className="grid grid-cols-2 gap-6">
          {" "}
          <OrdersTrendChart
            data={dashboardAnalytics?.sales_trend || []}
            period={analyticsPeriod}
            periodMeta={dashboardAnalytics?.period_meta}
            t={t}
          />{" "}
          <OrderInsightsPanel
            orderStatusData={analytics.statusData}
            categoryShareData={dashboardAnalytics?.category_share ?? []}
            t={t}
          />{" "}
        </div>{" "}
        {/* TOP SELLING PRODUCTS */}
        <div style={{ marginTop: 30 }}>
          {" "}
          <TopSellingProductsChart
            data={dashboardAnalytics?.top_selling_products || []}
            period={analyticsPeriod}
            periodMeta={dashboardAnalytics?.period_meta}
            t={t}
          />{" "}
        </div>{" "}
      </div>{" "}
      {/* ================= PAGE 2 ================= */}
      <div
        className="pdf-page"
        style={{
          width: "1032px",
          height: "1460px",
          padding: "39px",
          boxSizing: "border-box",
          background: "white",
          overflow: "hidden",
        }}
      >
        {/* ANALYTICS DASHBOARD */}
        <div
          style={{
            width: "100%",
            height: "520px",
          }}
        >
          <CategoryAnalyticsPanel
            analyticsData={dashboardAnalytics}
            period={analyticsPeriod}
            periodMeta={dashboardAnalytics?.period_meta}
            t={t}
          />
        </div>

        {/* CUSTOMERS */}
        <div
          style={{
            marginTop: 30,
            width: "100%",
            height: "420px",
          }}
        >
          <CustomersChart
            data={dashboardAnalytics?.customers_trend || []}
            period={analyticsPeriod}
            periodMeta={dashboardAnalytics?.period_meta}
            t={t}
          />
        </div>

        {/* LOW STOCK */}
        <div
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 12,
            background: "#ffffff",
          }}
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <HiExclamation className="text-red-500" />

            {t("dashboard.stock.lowStock")}
          </h3>

          <ul>
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} — {t("dashboard.common.stock")}: {p.stock}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
