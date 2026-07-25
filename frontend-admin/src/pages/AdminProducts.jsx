// frontend/src/pages/admin/AdminProducts.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/layout/AdminLayout";
import Pagination from "../components/ui/Pagination";
import ActivityLogPanel from "../components/admin/activity/ActivityLogPanel";
import ProductModal from "../components/admin/products/ProductModal";
import ProductHistoryModal from "../components/admin/products/ProductHistoryModal";
import ProductTable from "../components/admin/products/ProductTable";
import CategoryManager from "../components/admin/products/CategoryManager";
import TableSkeleton from "../components/ui/TableSkeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockMovements,
  getCategories,
} from "../services/api";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const { t } = useTranslation();
  const orderingMap = {
    name: "name",
    price: "price",
    stock: "stock",
    available: "available",
    created_at: "created_at",
    category: "category_name",
    parent_category: "parent_category_name",
  };
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async (
    pageNumber = 1,
    ordering = `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`,
    searchTerm = "",
  ) => {
    try {
      setLoading(true);

      const data = await getProducts(pageNumber, ordering, searchTerm);

      setProducts(data?.results || []);
      setNext(data?.next);
      setPrevious(data?.previous);
      setCount(data?.count || 0);
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

  const fetchCategories = async () => {
    try {
      let all = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const res = await getCategories(page);
        const data = res?.results || res;

        all = [...all, ...data];
        hasNext = !!res?.next;
        page++;
      }

      setCategories(all);
    } catch (err) {
      console.error("Error loading categories", err);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setIsModalOpen(true);
  };

  const openHistory = async (product) => {
    setSelectedProduct(product);
    setHistoryData([]);
    setHistoryLoading(true);
    setHistoryModal(true);

    try {
      const data = await getStockMovements(product.id);
      setHistoryData(data?.results || data || []);
    } catch (err) {
      console.error(err);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const isEdit = !!editing;

    try {
      if (isEdit) {
        await updateProduct(editing.id, formData);
        toast.success(t("products.toast.updated"));
      } else {
        await createProduct(formData);
        toast.success(t("products.toast.created"));
      }

      setIsModalOpen(false);
      setEditing(null);

      const ordering = `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`;

      fetchProducts(page, ordering, search);
    } catch (err) {
      console.error(err);

      toast.error(
        isEdit
          ? t("products.toast.updateError")
          : t("products.toast.createError"),
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      setDeleteLoading(true);

      await deleteProduct(deleteProductId);

      toast.success(t("products.toast.deleted"));

      const ordering = `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`;

      await fetchProducts(page, ordering, search);
    } catch (err) {
      console.error(err);

      toast.error(t("products.toast.deleteError"));
    } finally {
      setDeleteLoading(false);
      setDeleteProductId(null);
    }
  };

  useEffect(() => {
    const ordering = `${sortConfig.direction === "asc" ? "" : "-"}${orderingMap[sortConfig.key]}`;

    fetchProducts(page, ordering, search);
  }, [page, sortConfig, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-3">{t("products.title")}</h1>

        <div className="flex flex-row flex-wrap gap-2">
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + {t("products.new")}
          </button>

          <button
            onClick={() => setShowCategories(!showCategories)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            {showCategories ? t("categories.hide") : t("categories.manage")}
          </button>
        </div>
      </div>

      {showCategories && (
        <div className="mb-6">
          <CategoryManager />
        </div>
      )}

      <input
        type="text"
        placeholder={t("products.searchPlaceholder")}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="border p-2 rounded w-full mb-4 bg-white dark:bg-[#343a40] dark:text-white"
      />

      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <TableSkeleton rows={4} columns={1} />
        ) : products.length === 0 ? (
          <EmptyState title={t("products.noProducts")} />
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-3 shadow-sm bg-white dark:bg-[#343a40]"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{p.name}</h2>

                  <p className="text-sm text-gray-500">${p.price}</p>
                </div>

                {p.image_url && (
                  <img
                    src={p.image_url}
                    className="w-12 h-12 object-cover rounded"
                    alt={p.name}
                  />
                )}
              </div>

              <div className="flex gap-2 mt-3 text-sm">
                <button onClick={() => openEdit(p)}>{t("common.edit")}</button>

                <button onClick={() => openHistory(p)}>
                  {t("products.history")}
                </button>

                <button onClick={() => setDeleteProductId(p.id)}>
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP (EXTRACTED) */}
      {loading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : (
        <ProductTable
          products={products}
          onEdit={openEdit}
          onHistory={openHistory}
          onDelete={setDeleteProductId}
          sortConfig={sortConfig}
          onSort={handleSort}
          t={t}
        />
      )}

      <Pagination
        page={page}
        setPage={setPage}
        next={next}
        previous={previous}
        count={count}
      />

      {/* MODALS */}
      <ProductModal
        isOpen={isModalOpen}
        editing={editing}
        categories={categories}
        onSubmit={handleSubmit}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        t={t}
      />

      <ProductHistoryModal
        isOpen={historyModal}
        product={selectedProduct}
        data={historyData}
        loading={historyLoading}
        activitySlot={
          <ActivityLogPanel model="Product" objectId={selectedProduct?.id} />
        }
        onClose={() => {
          setHistoryModal(false);
          setSelectedProduct(null);
        }}
        t={t}
      />

      <ConfirmDialog
        isOpen={deleteProductId !== null}
        title={t("products.delete")}
        message={t("products.deleteConfirm")}
        confirmText={t("products.delete")}
        cancelText={t("products.cancel")}
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteProductId(null)}
      />
    </AdminLayout>
  );
}
