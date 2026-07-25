// frontend-admin/src/pages/AdminOrders.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/layout/AdminLayout.jsx";
import OrdersTable from "../components/admin/orders/OrdersTable.jsx";
import OrderDetailModal from "../components/admin/shared/OrderDetailModal.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import OrderFilters from "../components/admin/orders/OrderFilters.jsx";
import TableSkeleton from "../components/ui/TableSkeleton.jsx";
import { getAdminOrders, updateAdminOrder } from "../services/api.js";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  const orderingMap = {
    id: "id",
    customer_name: "customer_name",
    total: "total",
    created_at: "created_at",
    status: "status",
    payment_status: "payment_status",
  };

  const ordering = `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`;

  const fetchOrders = async (
  pageNumber = 1,
  ordering = `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`,
  searchTerm = search,
) => {
    setLoading(true);

    try {
      const data = await getAdminOrders(pageNumber, ordering, searchTerm);

      let ordersArray = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

     

      setOrders(ordersArray);

      setNext(data?.next || null);
      setPrevious(data?.previous || null);
      setCount(data?.count || ordersArray.length);
    } catch (err) {
      console.error("Error loading orders:", err);

      toast.error(t("orders.toast.loadError", "Error loading orders"));

      setOrders([]);
      setNext(null);
      setPrevious(null);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

    setPage(1);
  };

  const handleStatusChange = async (orderId, payload) => {
    if (!orderId || !payload) return;

    try {
      await updateAdminOrder(orderId, payload);

      toast.success(t("orders.toast.updated"));
      fetchOrders(page);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(t("orders.toast.transitionNotAllowed"));
    }
  };

  useEffect(() => {
  const ordering =
    `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`;

  fetchOrders(page, ordering, search);
}, [page, filterStatus, filterPayment, sortConfig, search]);

  return (
    <AdminLayout>
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {t("orders.title")}
      </h1>

      <input
  type="text"
  placeholder={t("orders.searchPlaceholder")}
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setPage(1);
  }}
  className="border p-2 rounded w-full mb-4 bg-white dark:bg-[#343a40] dark:text-white"
/>

      {/* FILTERS (EXTRACTED) */}
      <OrderFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPayment={filterPayment}
        setFilterPayment={setFilterPayment}
      />

      {/* TABLE */}
      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : (
        <OrdersTable
          orders={orders}
          onStatusChange={handleStatusChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          onOpenModal={(order) => {
            setModalLoading(true);
            setSelectedOrder(null);
            setIsModalOpen(true);

            setTimeout(() => {
              setSelectedOrder(order);
              setModalLoading(false);
            }, 300);
          }}
        />
      )}

      {/* PAGINATION */}
      <Pagination
        page={page}
        setPage={setPage}
        next={next}
        previous={previous}
        count={count}
        loading={loading}
      />

      {/* MODAL */}
      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        loading={modalLoading}
        onSave={handleStatusChange}
      />
    </AdminLayout>
  );
}
