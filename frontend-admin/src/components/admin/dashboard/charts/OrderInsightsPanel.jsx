// frontend-admin/src/components/admin/dashboard/charts/OrderInsightsPanel.jsx
import { memo } from "react";
import OrderStatusPieChart from "./OrderStatusPieChart";
import ProductCategorySalesTreemap from "./ProductCategorySalesTreemap";

function OrderInsightsPanel({
  orderStatusData = [],
  categoryShareData = [],
  t,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow transition-colors p-4 h-full flex flex-col gap-8">
      {/* ===================== */}
      {/* ORDER STATUS */}
      {/* ===================== */}
      <section>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          {t("dashboard.charts.orderStatus")}
        </h3>

        <OrderStatusPieChart data={orderStatusData} t={t} />
      </section>

      {/* ===================== */}
      {/* PRODUCT CATEGORY SHARE */}
      {/* ===================== */}
      <section>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          {t("dashboard.charts.productCategorySales")}
        </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
    {t("dashboard.charts.categorySalesDescription")}
  </p>

        <ProductCategorySalesTreemap data={categoryShareData} t={t} />
      </section>
    </div>
  );
}

export default memo(OrderInsightsPanel);
