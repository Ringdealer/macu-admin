// frontend-admin/src/components/admin/orders/OrderFilters.jsx
import { useTranslation } from "react-i18next";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../../config/orderConfig";

export default function OrderFilters({
  filterStatus,
  setFilterStatus,
  filterPayment,
  setFilterPayment,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* STATUS FILTER */}
      <select
      aria-label={t("orders.filter.allStatus")}
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="
          px-3 py-2 rounded border
          bg-white text-gray-900 border-gray-300
          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        <option value="">{t("orders.filter.allStatus")}</option>

        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(`orders.status.${status}`)}
          </option>
        ))}
      </select>

      {/* PAYMENT FILTER */}
      <select
      aria-label={t("orders.filter.allPayments")}
        value={filterPayment}
        onChange={(e) => setFilterPayment(e.target.value)}
        className="
          px-3 py-2 rounded border
          bg-white text-gray-900 border-gray-300
          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        <option value="">{t("orders.filter.allPayments")}</option>

        {PAYMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(`orders.payment.${status}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
