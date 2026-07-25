// frontend/src/components/admin/products/ProductTable.jsx
import { useMemo } from "react";
import EmptyState from "../../ui/EmptyState";
import SortableHeader from "../../ui/SortableHeader";

export default function ProductTable({
  products = [],
  onEdit,
  onHistory,
  onDelete,
  sortConfig,
  onSort,
  t,
}) {
  

  // -------------------------
  // HELPERS (clean + reusable)
  // -------------------------
  const getCategory = (p) =>
    typeof p.category === "object"
      ? p.category
      : { name: p.category_name || "" };

  const getParentCategory = (p) =>
    typeof p.category === "object" ? p.category?.parent?.name || "" : "";

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
     

      {/* TABLE */}
      <table className="w-full text-left">
        <thead className="bg-black text-white">
          <tr>
            <SortableHeader
              label={t("products.table.name")}
              sortKey="name"
              sortConfig={sortConfig}
              onSort={onSort}
            />

            <SortableHeader
              label={t("products.table.category")}
              sortKey="category"
              sortConfig={sortConfig}
              onSort={onSort}
            />

            <SortableHeader
              label={t("products.table.parentCategory")}
              sortKey="parent_category"
              sortConfig={sortConfig}
              onSort={onSort}
            />

            <SortableHeader
              label={t("products.table.price")}
              sortKey="price"
              sortConfig={sortConfig}
              onSort={onSort}
            />

            <SortableHeader
              label={t("products.table.stock")}
              sortKey="stock"
              sortConfig={sortConfig}
              onSort={onSort}
            />

            <th className="p-3">{t("products.table.available")}</th>

            <th className="p-3">{t("products.table.image")}</th>

            <th className="p-3">{t("products.table.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="8" className="p-0">
                <EmptyState
               title={t("products.noProducts")}
                />
              </td>
            </tr>
          ) : (
            filteredProducts.map((p, index) => {
              const category = getCategory(p);
              const parentCategory = getParentCategory(p);

              return (
                <tr
                  key={p.id}
                  className={`transition hover:brightness-95 ${
                    index % 2 === 0
                      ? "bg-[#ced4da] dark:bg-[#495057]"
                      : "bg-[#adb5bd] dark:bg-[#343a40]"
                  }`}
                >
                  {/* NAME */}
                  <td className="p-3 font-medium dark:text-white">{p.name}</td>

                  {/* CATEGORY */}
                  <td className="p-3 dark:text-gray-300">
                    {category?.name || t("products.noCategory")}
                  </td>

                  {/* PARENT CATEGORY */}
                  <td className="p-3 dark:text-gray-300">
                    {parentCategory || "-"}
                  </td>

                  {/* PRICE */}
                  <td className="p-3 font-semibold dark:text-white">
                    ${p.price}
                  </td>

                  {/* STOCK */}
                  <td className="p-3 dark:text-gray-300">{p.stock}</td>

                  {/* AVAILABLE */}
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        p.available
                          ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-400 text-red-950 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {p.available
                        ? t("products.available")
                        : t("products.unavailable")}
                    </span>
                  </td>

                  {/* IMAGE */}
                  <td className="p-3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        className="w-10 h-10 object-cover rounded"
                        alt={p.name}
                      />
                    ) : (
                      <span className="text-gray-800 dark:text-gray-200">
                        {t("common.none")}
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
                    >
                      {t("products.edit")}
                    </button>

                    <button
                      onClick={() => onHistory(p)}
                      className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded transition"
                    >
                      {t("products.history")}
                    </button>

                    <button
                      onClick={() => onDelete(p.id)}
                      className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded transition"
                    >
                      {t("products.delete")}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
