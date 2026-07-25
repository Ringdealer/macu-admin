// frontend-admin/src/components/admin/OrdersTable.jsx
import { useMemo, useState } from "react";
import OrderDetailModal from "../shared/OrderDetailModal";
import TableSkeleton from "../../ui/TableSkeleton";
import { useTranslation } from "react-i18next";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  getOrderStatusLabelKey,
  getPaymentStatusLabelKey,
} from "../../../config/orderConfig";
import EmptyState from "../../ui/EmptyState";
import SortableHeader from "../../ui/SortableHeader";

export default function OrdersTable({
  orders = [],
  onStatusChange,
  onSort,
  sortConfig,
  loading = false,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  

  // LIGHT MODE (stronger backgrounds)
  const statusColors = {
    delivered: "bg-[#2d6a4f] text-white",
    returned: "bg-[#a4161a] text-white",
    cancelled: "bg-[#a4161a] text-white",
  };

  const paymentStatusColors = {
    paid: "bg-[#2d6a4f] text-white",
    failed: "bg-[#a4161a] text-white",
  };

  const statusLabels = {
    pending: t("orders.status.pending"),
    confirmed: t("orders.status.confirmed"),
    packed: t("orders.status.packed"),
    shipped: t("orders.status.shipped"),
    in_transit: t("orders.status.in_transit"),
    delivered: t("orders.status.delivered"),
    returned: t("orders.status.returned"),
    cancelled: t("orders.status.cancelled"),
  };

  const cleanCustomerName = (name) => {
    if (!name) return "Cliente";
    return name.replace(/\s*\(.*?\)\s*/g, "").trim();
  };

  // DARK MODE ONLY TEXT OVERRIDE (SINGLE SOURCE OF TRUTH)
  const getDarkStatusTextClass = (value) => {
    if (["delivered", "paid"].includes(value)) {
      return "dark:text-[#40916c]";
    }

    if (["cancelled", "failed", "returned"].includes(value)) {
      return "dark:text-[#a4161a]";
    }

    return "dark:text-gray-300";
  };

  const normalizePhoneE164 = (phone) => {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, "");

    if (!cleaned) return null;

    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`;
    }

    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  };

  const getWhatsAppNumber = (phone) => {
    const normalized = normalizePhoneE164(phone);
    if (!normalized) return null;
    return normalized.replace("+", "");
  };

  const buildWhatsAppUrl = (order) => {
    const phoneRaw = order.customer_phone || order.phone;
    const waNumber = getWhatsAppNumber(phoneRaw);

    if (!waNumber) return null;

    const message = `
🧾 *Pedido #${order.id}*

👤 Cliente: ${cleanCustomerName(order.customer_name)}
💰 Total: $${order.total}
📦 Estado: ${statusLabels[order.status] || "Desconocido"}

📅 Fecha: ${new Date(order.created_at).toLocaleDateString(
      i18n.language === "es" ? "es-ES" : "en-US",
    )}

Gracias por tu compra 🙌
`.trim();

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  };

  const openWhatsApp = (order) => {
    const url = buildWhatsAppUrl(order);
    if (!url) {
      alert("Número de teléfono inválido para WhatsApp");
      return;
    }
    window.open(url, "_blank");
  };

 

 

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800 transition-colors">
      {/* MOBILE */}
      <div className="md:hidden space-y-3 p-2">
        {loading ? (
          <TableSkeleton rows={4} columns={1} />
        ) : orders.length === 0 ? (
          <EmptyState title={t("orders.noOrders")} />
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-3 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  #{order.id}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(order.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>

              <div className="text-sm mb-2 text-gray-800 dark:text-gray-300">
                {cleanCustomerName(order.customer_name)}
              </div>

              <div className="text-sm mb-3 font-semibold text-gray-900 dark:text-white">
                ${order.total}
              </div>

              {/* STATUS */}
              <select
                aria-label={`${t("orders.table.status")} #${order.id}`}
                value={order.status}
                onChange={(e) =>
                  onStatusChange(order.id, { status: e.target.value })
                }
                className={`
            px-2 py-1 text-sm md:text-base rounded border
            bg-white text-black
            dark:bg-gray-800 dark:border-gray-700
            ${getDarkStatusTextClass(order.status)}
          `}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(getOrderStatusLabelKey(status))}
                  </option>
                ))}
              </select>

              {/* PAYMENT */}
              <select
                aria-label={`${t("orders.table.payment")} #${order.id}`}
                value={order.payment_status || "unpaid"}
                onChange={(e) =>
                  onStatusChange(order.id, {
                    payment_status: e.target.value,
                  })
                }
                className={`
            px-2 py-1 text-sm md:text-base rounded border
            bg-white text-black
            dark:bg-gray-800 dark:border-gray-700
            ${getDarkStatusTextClass(order.payment_status)}
          `}
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(getPaymentStatusLabelKey(status))}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsModalOpen(true);
                  }}
                  className="text-blue-900 dark:text-blue-200 font-medium"
                >
                  {t("orders.actions.view")}
                </button>

                <button
                  onClick={() => openWhatsApp(order)}
                  className="
  px-2 py-1
  rounded
  bg-green-700
  text-white
  hover:bg-green-800
"
                >
                  {t("orders.actions.whatsapp")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-white">
            <tr>
              <SortableHeader
                label={t("orders.table.order")}
                sortKey="id"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("orders.table.customer")}
                sortKey="customer_name"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("orders.table.total")}
                sortKey="total"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("orders.table.status")}
                sortKey="status"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("orders.table.payment")}
                sortKey="payment_status"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("orders.table.date")}
                sortKey="created_at"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <th className="p-3">{t("orders.table.actions")}</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <EmptyState title={t("orders.noOrders")} className="py-16" />
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`transition hover:brightness-95 ${
                    index % 2 === 0
                      ? "bg-[#ced4da] dark:bg-[#495057]"
                      : "bg-[#adb5bd] dark:bg-[#343a40]"
                  }`}
                >
                  <td className="p-3 font-medium dark:text-white">
                    #{order.id}
                  </td>

                  <td className="p-3 dark:text-gray-300">
                    {cleanCustomerName(order.customer_name)}
                  </td>

                  <td className="p-3 font-semibold dark:text-white">
                    ${order.total}
                  </td>

                  <td className="p-3">
                    <select
                      aria-label={`${t("orders.table.status")} #${order.id}`}
                      value={order.status}
                      onChange={(e) =>
                        onStatusChange(order.id, { status: e.target.value })
                      }
                      className={`px-2 py-1 rounded border
              ${statusColors[order.status] || "bg-white text-black"}
              dark:bg-gray-800 dark:border-gray-700
              ${getDarkStatusTextClass(order.status)}
            `}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(getOrderStatusLabelKey(status))}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <select
                      aria-label={`${t("orders.table.payment")} #${order.id}`}
                      value={order.payment_status || "unpaid"}
                      onChange={(e) =>
                        onStatusChange(order.id, {
                          payment_status: e.target.value,
                        })
                      }
                      className={`px-2 py-1 rounded border
              ${paymentStatusColors[order.payment_status || "unpaid"] || "bg-white text-black"}
              dark:bg-gray-800 dark:border-gray-700
              ${getDarkStatusTextClass(order.payment_status || "unpaid")}
            `}
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(getPaymentStatusLabelKey(status))}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("es-ES")}
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-900 dark:text-blue-200 font-medium"
                    >
                      {t("orders.actions.view")}
                    </button>

                    <button
                      onClick={() => openWhatsApp(order)}
                      className="
  px-2 py-1
  rounded
  bg-green-700
  text-white
  hover:bg-green-800
"
                    >
                      {t("orders.actions.whatsapp")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onSave={onStatusChange}
      />
    </div>
  );
}
