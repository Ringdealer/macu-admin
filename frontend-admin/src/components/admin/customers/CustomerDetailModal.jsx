import { useTranslation } from "react-i18next";
import { updateCustomer, deleteCustomer } from "../../../services/api";
import toast from "react-hot-toast";
import EmptyState from "../../ui/EmptyState";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { Fragment, useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";



export default function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onOpenOrder,
  onCustomerUpdated,
  loading = false,
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const EMPTY_ORDERS = [];
  const orders = customer?.orders ?? EMPTY_ORDERS;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });

      setIsEditing(false);
    }
  }, [customer]);

  const lifetimeValue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterPayment && o.payment_status !== filterPayment) return false;

      return true;
    });
  }, [orders, filterStatus, filterPayment]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const lastOrderDate = orders.length
      ? new Date(
          Math.max(...orders.map((o) => new Date(o.created_at).getTime())),
        )
      : null;

    return {
      totalOrders,
      lastOrderDate,
    };
  }, [orders]);

  

 

  const handleSave = async () => {
    try {
      await updateCustomer(customer.id, form);

      toast.success(t("customers.toast.updated"));

      setIsEditing(false);
      onCustomerUpdated?.();
    } catch (err) {
      console.error(err);
      toast.error(t("customers.toast.updateError"));
    }
  };

 const handleDelete = async () => {
  if (!customer) return;

  try {
    setDeleteLoading(true);

    await deleteCustomer(customer.id);

    toast.success(t("customers.toast.deleted"));

    onCustomerUpdated?.();
    onClose();
  } catch (err) {
    console.error(err);
    toast.error(t("customers.toast.deleteError"));
  } finally {
    setDeleteLoading(false);
    setConfirmDelete(false);
  }
};

  return (
    <Transition appear show={isOpen} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-[10000]"
      onClose={loading ? () => {} : onClose}
    >
      <TransitionChild
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/60" />
      </TransitionChild>

      <div className="fixed inset-0 flex items-center justify-center p-3 md:p-4">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel
            className="
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              w-full
              max-w-3xl md:max-w-4xl
              max-h-[92vh]
              overflow-y-auto
              rounded-lg
              p-4 md:p-6
              border border-gray-200 dark:border-gray-700
            "
          > {loading ? (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  ) : (
    <>
        <div className="flex justify-between mb-3 md:mb-4">
         <DialogTitle className="text-lg md:text-xl font-bold">
    {customer?.name || "N/A"}
</DialogTitle>

          <button
            className="
              text-lg
              text-gray-500 dark:text-gray-300
              hover:text-black dark:hover:text-white
            "
            onClick={() => onClose()}
          >
            ✕
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mb-3 md:mb-4">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-black px-3 py-1 rounded text-sm md:text-base"
          >
            {t("customers.edit")}
          </button>

          <button
  onClick={() => setConfirmDelete(true)}
  className="bg-red-600 text-white px-3 py-1 rounded text-sm md:text-base"
>
            {t("customers.delete")}
          </button>
        </div>

        {/* EDIT FORM */}
        {isEditing && (
          <div
            className="
              mb-4 space-y-2
              border border-gray-200 dark:border-gray-700
              p-3 rounded
              bg-gray-100 dark:bg-gray-800
            "
          >
            {["name", "email", "phone", "address"].map((field) => (
              <input
                key={field}
                value={form[field]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field]: e.target.value,
                  })
                }
                placeholder={t(`customers.fields.${field}`)}
                className="
                  border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100
                  p-2 w-full
                  text-sm md:text-base
                  rounded
                "
              />
            ))}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                {t("customers.save")}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                {t("customers.cancel")}
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMER SUMMARY */}
        <div
          className="
            bg-gray-100 dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            p-3 md:p-4
            rounded
            mb-3 md:mb-4
            space-y-1
            text-sm md:text-base
          "
        >
          <p>
            <strong>{t("customers.totalOrders")}:</strong> {stats.totalOrders}
          </p>

          <p>
            <strong>{t("customers.lastOrder")}:</strong>{" "}
            {stats.lastOrderDate
              ? stats.lastOrderDate.toLocaleDateString("es-ES")
              : "-"}
          </p>
        </div>

        {/* LIFETIME VALUE */}
        <div
          className="
            bg-green-100 dark:bg-green-900
            border border-green-300 dark:border-green-700
            p-3
            rounded
            mb-3 md:mb-4
          "
        >
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {t("customers.lifetimeValue")}
          </p>

          <p className="text-lg md:text-xl font-bold text-green-700 dark:text-green-300">
            ${lifetimeValue}
          </p>
        </div>

       {/* FILTERS */}
<div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
  <select
    aria-label={t("customers.filter.status")}
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="
      border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
      p-2 rounded
      text-sm md:text-base
    "
  >
    <option value="">{t("customers.filter.allStatus")}</option>

    <option value="pending">{t("orders.status.pending")}</option>
    <option value="confirmed">{t("orders.status.confirmed")}</option>
    <option value="fulfilled">{t("orders.status.delivered")}</option>
    <option value="cancelled">{t("orders.status.cancelled")}</option>
  </select>

  <select
    aria-label={t("customers.filter.payment")}
    value={filterPayment}
    onChange={(e) => setFilterPayment(e.target.value)}
    className="
      border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
      p-2 rounded
      text-sm md:text-base
    "
  >
    <option value="">{t("customers.filter.allPayments")}</option>

    <option value="paid">{t("orders.payment.paid")}</option>
    <option value="unpaid">{t("orders.payment.unpaid")}</option>
    <option value="failed">{t("orders.payment.failed")}</option>
  </select>
</div>

        {/* ORDERS TABLE */}
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState title={t("customers.noOrders")} />
        ) : (
          <div className="overflow-x-auto">
            <table
              className="
                w-full
                text-xs md:text-sm
                border border-gray-200 dark:border-gray-700
              "
            >
              <thead
                className="
                  bg-gray-100 dark:bg-gray-800
                  text-gray-900 dark:text-gray-200
                "
              >
                <tr>
                  <th className="p-2 text-left">{t("orders.table.order")}</th>

                  <th className="p-2 text-left">{t("orders.table.status")}</th>

                  <th className="p-2 text-left">{t("orders.table.payment")}</th>

                  <th className="p-2 text-left">{t("orders.table.total")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onOpenOrder?.(order)}
                    className="
                      cursor-pointer
                      border-t border-gray-200 dark:border-gray-700
                      hover:bg-gray-100 dark:hover:bg-gray-800
                    "
                  >
                    <td className="p-2">#{order.id}</td>

                    <td className="p-2">
                      <span
                        className="
                          px-2 py-1 rounded text-xs
                          bg-gray-200 dark:bg-gray-700
                          text-gray-800 dark:text-gray-200
                        "
                      >
                        {t(`orders.status.${order.status}`) || order.status}
                      </span>
                    </td>

                    <td className="p-2">
                      <span
                        className="
                          px-2 py-1 rounded text-xs
                          bg-gray-200 dark:bg-gray-700
                          text-gray-800 dark:text-gray-200
                        "
                      >
                        {t(`orders.payment.${order.payment_status}`) ||
                          order.payment_status}
                      </span>
                    </td>

                    <td className="p-2 font-medium">${order.total || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>

        )}
      </>)}  
     </DialogPanel>
        </TransitionChild>
      </div>
      <ConfirmDialog
  isOpen={confirmDelete}
  title={t("customers.delete")}
  message={t("customers.deleteConfirm")}
  confirmText={t("customers.delete")}
  cancelText={t("customers.cancel")}
  confirmVariant="danger"
  loading={deleteLoading}
  onConfirm={handleDelete}
  onCancel={() => setConfirmDelete(false)}
/>
   </Dialog>
  </Transition>
  );
}
