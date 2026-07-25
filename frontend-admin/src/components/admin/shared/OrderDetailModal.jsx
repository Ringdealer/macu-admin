import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useTranslation } from "react-i18next";
import OrderTimeline from "../orders/OrderTimeline";
import NotificationHistory from "../activity/NotificationHistory";
import AdminOrderNotes from "../orders/AdminOrderNotes";
import ActivityLogPanel from "../activity/ActivityLogPanel";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  getOrderStatusLabelKey,
  getPaymentStatusLabelKey,
} from "../../../config/orderConfig";

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onSave,
  loading = false,
}) {
  const [localOrder, setLocalOrder] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (order) {
      setLocalOrder(structuredClone(order));
    } else {
      setLocalOrder(null);
    }
  }, [order]);

  const updateField = (field, value) => {
    setLocalOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!localOrder?.id) return;

    const { id, ...payload } = localOrder;

    onSave?.(id, payload);

    onClose();
  };

  if (!isOpen) return null;

  if (loading || !localOrder) {
    return (
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
          <TransitionChild as={Fragment}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-3">
            <div
              className="
              w-full max-w-2xl
              bg-white dark:bg-gray-900
              rounded-lg
              p-6
              border border-gray-200 dark:border-gray-700
            "
            >
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
        {/* BACKDROP */}
        <TransitionChild as={Fragment}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* WRAPPER */}
        <div className="fixed inset-0 flex items-end md:items-center md:justify-center p-0 md:p-3 overflow-hidden">
          <TransitionChild as={Fragment}>
            <DialogPanel
              className="
                w-full md:max-w-2xl
                bg-white dark:bg-gray-900
                shadow-xl
                md:rounded-lg
                h-[92vh] md:max-h-[90vh]
                flex flex-col
                overflow-hidden
                border border-gray-200 dark:border-gray-700
              "
            >
              {/* HEADER */}
              <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
                <DialogTitle className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                  {t("orders.modal.title")} #{localOrder.id}
                </DialogTitle>
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 space-y-5 text-sm md:text-base">
                {/* CLIENT */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t("orders.modal.customer")}
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 break-words">
                    {(localOrder.customer_name || "Cliente").replace(
                      /\s*\(.*?\)\s*/g,
                      "",
                    )}
                  </p>
                </div>

                {/* STATUS */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t("orders.modal.status")}
                  </p>

                  <select
                    value={localOrder.status || ""}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="
                      border px-2 py-2 w-full rounded text-sm
                      bg-white text-gray-900 border-gray-300
                      dark:bg-gray-800 dark:text-white dark:border-gray-700
                    "
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(getOrderStatusLabelKey(status))}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PAYMENT */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t("orders.modal.payment")}
                  </p>

                  <select
                    value={localOrder.payment_status || "unpaid"}
                    onChange={(e) =>
                      updateField("payment_status", e.target.value)
                    }
                    className="
                      border px-2 py-2 w-full rounded text-sm
                      bg-white text-gray-900 border-gray-300
                      dark:bg-gray-800 dark:text-white dark:border-gray-700
                    "
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(getPaymentStatusLabelKey(status))}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PHONE */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t("orders.modal.phone")}
                  </p>

                  <input
                    value={localOrder.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="
                      border px-2 py-2 w-full rounded text-sm
                      bg-white text-gray-900 border-gray-300
                      dark:bg-gray-800 dark:text-white dark:border-gray-700
                    "
                  />
                </div>

                {/* ADDRESS */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t("orders.modal.address")}
                  </p>

                  <input
                    value={localOrder.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="
                      border px-2 py-2 w-full rounded text-sm
                      bg-white text-gray-900 border-gray-300
                      dark:bg-gray-800 dark:text-white dark:border-gray-700
                    "
                  />
                </div>

                {/* MODULES */}
                <OrderTimeline status={localOrder.status} />

                <AdminOrderNotes orderId={localOrder.id} />

                <ActivityLogPanel model="Order" objectId={localOrder.id} />

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">
                    {t("orders.notifications")}
                  </h3>

                  <NotificationHistory orderId={localOrder.id} />
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-2 shrink-0">
                <button
                  onClick={onClose}
                  className="
                    flex-1 md:flex-none px-3 py-2 rounded text-sm transition
                    bg-gray-200 text-gray-800 hover:bg-gray-300
                    dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
                  "
                >
                  {t("orders.modal.close")}
                </button>

                <button
                  onClick={handleSave}
                  className="
                    flex-1 md:flex-none px-3 py-2 rounded text-sm transition
                    bg-blue-600 text-white hover:bg-blue-700
                  "
                >
                  {t("orders.modal.save")}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
