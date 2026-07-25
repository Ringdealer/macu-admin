// frontend-admin/src/pages/AdminCustomers.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/admin/layout/AdminLayout";
import {
  getCustomers,
  getOrderById,
  createCustomer,
  getCustomerById,
} from "../services/api";
import Pagination from "../components/ui/Pagination";
import CustomerDetailModal from "../components/admin/customers/CustomerDetailModal";
import OrderDetailModal from "../components/admin/shared/OrderDetailModal";
import CustomerCreateModal from "../components/admin/customers/CustomerCreateModal";
import CustomerTable from "../components/admin/customers/CustomerTable";
import TableSkeleton from "../components/ui/TableSkeleton";
import EmptyState from "../components/ui/EmptyState";
import toast from "react-hot-toast";

export default function AdminCustomers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
  key: "name",
  direction: "asc",
});
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
 const orderingMap = {
  name: "customer_name",
  email: "user__email",
  phone: "phone",
  address: "address",
  is_verified: "user__is_verified",
};

  const fetchCustomers = async (
  pageNumber = 1,
  ordering = "-user__first_name"
) =>  {
  
    try {
      setLoading(true);

      const data = await getCustomers(
  pageNumber,
  ordering,
  search,
);

      const list = Array.isArray(data?.results) ? data.results : [];

      const normalized = list.map((c) => ({
        ...c,
        id: c.id ?? c.uuid,
      }));

      setCustomers(normalized);
      

      setNext(data?.next || null);
      setPrevious(data?.previous || null);
      setCount(data?.count || 0);
    } catch (err) {
      console.error(err);

      toast.error(t("customers.errorLoad"));

      setCustomers([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    
  setSortConfig((prev) => ({
    key,
    direction:
      prev.key === key && prev.direction === "asc"
        ? "desc"
        : "asc",
  }));

  setPage(1);
};

const handleSearch = (value) => {
  setSearch(value);
  setPage(1);
};

  const openCustomer = async (customer) => {
    try {
      setCustomerLoading(true);

      setSelectedCustomer(null);
      setIsModalOpen(true);

      const fullCustomer = await getCustomerById(customer.id);

      setSelectedCustomer(fullCustomer);
    } catch (err) {
      console.error("Error loading customer:", err);
      toast.error(t("customers.errorLoad"));
      setIsModalOpen(false);
    } finally {
      setCustomerLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  const handleOpenOrder = async (order) => {
    try {
      const fullOrder = await getOrderById(order.id);
      setSelectedOrder(fullOrder);
      setIsOrderOpen(true);
    } catch (err) {
      console.error("Error al cargar la orden:", err);
    }
  };

  const handleCreateCustomer = async (payload) => {
    try {
      if (!payload.name) {
        toast.error(t("customers.validation.nameRequired"));
        return;
      }

      if (!payload.phone) {
        toast.error(t("customers.validation.phoneRequired"));
        return;
      }

      if (!payload.password) {
        toast.error(t("customers.validation.passwordRequired"));
        return;
      }

      const finalPayload = {
        ...payload,
        phone: `${payload.country_code}${payload.phone}`,
      };

      await createCustomer(finalPayload);

      toast.success(t("customers.toast.created"));

      setIsCreateOpen(false);

      setPage(1);
      setTimeout(
  () => fetchCustomers(1, "-user__first_name"),
  50
);
    } catch (err) {
      console.error(err);
      toast.error(t("customers.toast.createError"));
    }
  };

 useEffect(() => {
  const ordering =
    `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`;

  fetchCustomers(page, ordering);
}, [page, sortConfig, search]);

  return (
    <AdminLayout>
      <div className="p-3 md:p-6 text-gray-900 dark:text-gray-100">
        {/* HEADER */}
        <div className="mb-3 md:mb-4">
          <div className="flex justify-between items-center md:items-start md:flex-col md:gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {t("customers.title")}
              </h1>

              <p className="text-xs md:text-sm text-gray-500">
                {t("customers.total")}: {count}
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base md:self-start"
            >
              + {t("customers.new")}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder={t("customers.searchPlaceholder")}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="border p-2 rounded w-full mb-4 text-sm md:text-base bg-white dark:bg-[#343a40] dark:text-white"
        />

        {/* MOBILE LIST */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <TableSkeleton rows={4} columns={1} />
          ) : customers.length === 0 ? (
            <EmptyState title={t("customers.noCustomers")} />
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                onClick={() => openCustomer(c)}
                className="border rounded-lg p-3 shadow-sm bg-white dark:bg-[#343a40] active:scale-[0.99]"
              >
                <div className="font-semibold text-sm">{c.name || "N/A"}</div>

                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {c.email}
                </div>

                <div className="text-xs">{c.phone || "-"}</div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE (EXTRACTED COMPONENT) */}
        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : (
          <CustomerTable
    customers={customers}
    onRowClick={openCustomer}
    sortConfig={sortConfig}
    onSort={handleSort}
/>
        )}

        {/* PAGINATION */}
        <Pagination
          page={page}
          setPage={setPage}
          next={next}
          previous={previous}
          loading={loading}
        />

        {/* CREATE MODAL */}
        <CustomerCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateCustomer}
        />

        {/* CUSTOMER DETAIL */}
        <CustomerDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          customer={selectedCustomer}
          onOpenOrder={handleOpenOrder}
          onCustomerUpdated={() => fetchCustomers(page)}
          loading={customerLoading}
        />

        {/* ORDER DETAIL */}
        {isOrderOpen && selectedOrder && (
          <OrderDetailModal
            isOpen={isOrderOpen}
            onClose={() => {
              setIsOrderOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
}
