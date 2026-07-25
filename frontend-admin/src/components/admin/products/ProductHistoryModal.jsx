// frontend-admin/src/components/admin/products/ProductHistoryModal.jsx
import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import TableSkeleton from "../../ui/TableSkeleton";
import EmptyState from "../../ui/EmptyState";

export default function ProductHistoryModal({
  isOpen,
  product,
  data,
  activitySlot,
  onClose,
  t,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
        {/* BACKDROP */}
        <TransitionChild as={Fragment}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* WRAPPER */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as={Fragment}>
            <DialogPanel
              className="
                w-full
                max-w-[700px]
                max-h-[85vh]
                overflow-y-auto
                rounded-lg
                bg-white
                dark:bg-[#212529]
                dark:text-white
                p-6
                shadow-xl
                space-y-4
              "
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-bold">
                  {t("products.historyModal.title")} — {product?.name}
                </DialogTitle>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              {/* STOCK HISTORY */}
              <div className="overflow-x-auto">
                {loading ? (
                  <TableSkeleton rows={5} columns={3} />
                ) : !data?.length ? (
                  <EmptyState
                    title={t("products.historyModal.empty")}
                    className="py-8"
                  />
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="p-2">
                          {t("products.historyModal.date")}
                        </th>

                        <th className="p-2">
                          {t("products.historyModal.change")}
                        </th>

                        <th className="p-2">
                          {t("products.historyModal.type")}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((h) => (
                        <tr
                          key={h.id}
                          className="border-t dark:border-gray-700"
                        >
                          <td className="p-2">
                            {new Date(h.created_at).toLocaleString()}
                          </td>

                          <td
                            className={`p-2 ${
                              h.change > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {h.change > 0 ? "+" : ""}
                            {h.change}
                          </td>

                          <td className="p-2">
                            {h.reason_display_es || h.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ACTIVITY LOG */}
              <div>
                <h3 className="font-semibold mt-4 mb-2">
                  {t("products.historyModal.audit")}
                </h3>

                {activitySlot}
              </div>

              {/* FOOTER */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  {t("products.close")}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
