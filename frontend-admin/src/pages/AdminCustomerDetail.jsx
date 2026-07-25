// frontend-admin/src/pages/AdminCustomerDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/admin/layout/AdminLayout";
import { getCustomerById } from "../services/api";
import EmptyState from "../components/ui/EmptyState";
import CardSkeleton from "../components/ui/CardSkeleton";
import { useTranslation } from "react-i18next";

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await getCustomerById(id);
      setCustomer(data);
    } catch (err) {
      console.error(err);
      setError(t("customers.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6">
          <CardSkeleton />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <p className="p-4 md:p-6 text-red-500">{error}</p>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <EmptyState title={t("customers.notFound")} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-xl md:text-2xl font-bold dark:text-white">
          {t("customers.detailTitle")}
        </h1>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 shadow rounded-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t("customers.fields.name")}
            </span>
            <span className="text-gray-900 dark:text-white">
              {customer.name}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t("customers.fields.email")}
            </span>
            <span className="text-gray-900 dark:text-white break-all">
              {customer.email}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t("customers.fields.phone")}
            </span>
            <span className="dark:text-gray-200">{customer.phone || "-"}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t("customers.fields.address")}
            </span>
            <span className="dark:text-gray-200">
              {customer.address || "-"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t("customers.fields.totalOrders")}
            </span>
            <span className="dark:text-gray-200">{customer.total_orders}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t("customers.fields.lastOrder")}
            </span>
            <span className="dark:text-gray-200">
              {customer.last_order_date
                ? new Date(customer.last_order_date).toLocaleDateString("es-ES")
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
