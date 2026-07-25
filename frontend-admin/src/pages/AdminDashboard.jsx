//frontend-admin/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/admin/layout/AdminLayout";
import {
  getOrders,
  getLowStockProducts,
  getDashboardAnalytics,
} from "../services/api";
import useDashboardAnalytics from "../components/admin/dashboard/hooks/useDashboardAnalytics";
import DashboardHeader from "../components/admin/dashboard/charts/DashboardHeader";
import { useTheme } from "../context/ThemeContext";
import TotalOrdersKpi from "../components/admin/dashboard/kpis/TotalOrdersKpi";
import PendingOrdersKpi from "../components/admin/dashboard/kpis/PendingOrdersKpi";
import RevenueKpi from "../components/admin/dashboard/kpis/RevenueKpi";
import OrdersTrendChart from "../components/admin/dashboard/charts/OrdersTrendChart";
import CustomersChart from "../components/admin/dashboard/charts/CustomersChart";
import TopSellingProductsChart from "../components/admin/dashboard/charts/TopSellingProductsChart";
import CategoryAnalyticsPanel from "../components/admin/dashboard/charts/AnalyticsDashboardPanel";
import OrderInsightsPanel from "../components/admin/dashboard/charts/OrderInsightsPanel";
import { HiExclamation } from "react-icons/hi";
import DashboardSkeleton from "../components/admin/dashboard/shared/DashboardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ChartSkeleton from "../components/ui/ChartSkeleton";
import DashboardReport from "../components/admin/dashboard/export/DashboardReport";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("year");
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // -------------------------
  // LOAD BACKEND ANALYTICS
  // -------------------------

  const loadDashboardAnalytics = async () => {
    setLoadingAnalytics(true);

    try {
      const data = await getDashboardAnalytics(analyticsPeriod);
      setDashboardAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchData = async () => {
    try {
      const data = await getOrders();
      const ordersArray = Array.isArray(data) ? data : data?.results || [];
      setOrders(ordersArray);

      const lowStockData = await getLowStockProducts();
      setLowStock(lowStockData?.results || lowStockData || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  const analytics = useDashboardAnalytics(orders, t);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    loadDashboardAnalytics();
  }, [analyticsPeriod]);

  return (
    <AdminLayout>
      <DashboardHeader
        isMobile={isMobile}
        title={t("dashboard.title")}
        period={analyticsPeriod}
        periodMeta={dashboardAnalytics?.period_meta}
        onPeriodChange={setAnalyticsPeriod}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        exportingPDF={exportingPDF}
        onExportPDF={async () => {
          setExportingPDF(true);

          try {
            const { exportChartToPDF } =
              await import("../utils/exportChartToPdf");

            await exportChartToPDF("analytics-report", "analytics-report.pdf");
          } finally {
            setExportingPDF(false);
          }
        }}
      />

      <div className="pt-8">
        {loadingAnalytics ? (
          <DashboardSkeleton />
        ) : (
          <div id="analytics-export-page-1">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <TotalOrdersKpi analytics={analytics} t={t} />
              <PendingOrdersKpi analytics={analytics} t={t} />
              <RevenueKpi analytics={analytics} t={t} />
            </div>

            {/* REVENUE SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <p className="text-gray-600 dark:text-gray-300">
                  {t("dashboard.revenue.today")}
                </p>
                <h2 className="text-xl font-bold">
                  ${analytics.revenueToday.toFixed(2)}
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <p className="text-gray-600 dark:text-gray-300">
                  {t("dashboard.revenue.week")}
                </p>
                <h2 className="text-xl font-bold">
                  ${analytics.revenueWeek.toFixed(2)}
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <p className="text-gray-600 dark:text-gray-300">
                  {t("dashboard.revenue.month")}
                </p>
                <h2 className="text-xl font-bold">
                  ${analytics.revenueMonth.toFixed(2)}
                </h2>
              </div>
            </div>

            {/* OPERATIONAL CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              />
            </div>

            {/* TOP SELLING PRODUCTS */}
            <div
              className="
              mt-6
              p-5
              rounded-xl
              bg-white
              dark:bg-gray-800
              shadow
            "
            >
              <TopSellingProductsChart
                data={dashboardAnalytics?.top_selling_products || []}
                period={analyticsPeriod}
                periodMeta={dashboardAnalytics?.period_meta}
                t={t}
              />
            </div>

            <div id="analytics-export-page-2">
              {/* ANALYTICS DASHBOARD */}
              <div className="mt-6 w-full overflow-x-hidden">
                <CategoryAnalyticsPanel
                  analyticsData={dashboardAnalytics}
                  period={analyticsPeriod}
                  periodMeta={dashboardAnalytics?.period_meta}
                  t={t}
                />
              </div>

              {/* CUSTOMERS */}
              <div className="mt-6 w-full overflow-x-hidden">
                <CustomersChart
                  data={dashboardAnalytics?.customers_trend || []}
                  period={analyticsPeriod}
                  periodMeta={dashboardAnalytics?.period_meta}
                  t={t}
                />
              </div>

              {/* LOW STOCK */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <HiExclamation className="text-red-500" />
                  {t("dashboard.stock.lowStock")}
                </h3>

                {lowStock.length ? (
                  <ul className="space-y-2">
                    {lowStock.map((p) => (
                      <li key={p.id} className="text-red-500 dark:text-red-400">
                        {p.name} — {t("dashboard.common.stock")}: {p.stock}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-[180px] flex items-center justify-center">
                    <EmptyState
                      title={t("dashboard.noData")}
                      description={t("dashboard.stock.noLowStock")}
                      icon={HiExclamation}
                    />
                  </div>
                )}
              </div>

              <DashboardReport
                analytics={analytics}
                dashboardAnalytics={dashboardAnalytics}
                analyticsPeriod={analyticsPeriod}
                lowStock={lowStock}
                t={t}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
