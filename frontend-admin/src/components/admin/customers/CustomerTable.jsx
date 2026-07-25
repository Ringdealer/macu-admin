// frontend-admin/src/components/admin/customers/CustomerTable.jsx
import { useTranslation } from "react-i18next";
import EmptyState from "../../ui/EmptyState";
import SortableHeader from "../../ui/SortableHeader";

export default function CustomerTable({
  customers = [],
  onRowClick,
  sortConfig,
  onSort,
}) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800 transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <SortableHeader
                label={t("customers.fields.name")}
                sortKey="name"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("customers.fields.email")}
                sortKey="email"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("customers.fields.phone")}
                sortKey="phone"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("customers.fields.address")}
                sortKey="address"
                sortConfig={sortConfig}
                onSort={onSort}
              />

              <SortableHeader
                label={t("customers.fields.verified")}
                sortKey="is_verified"
                sortConfig={sortConfig}
                onSort={onSort}
              />
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <EmptyState title={t("customers.noCustomers")} />
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={`transition ${
                    index % 2 === 0
                      ? "bg-[#ced4da] dark:bg-[#495057]"
                      : "bg-[#adb5bd] dark:bg-[#343a40]"
                  }`}
                >
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => onRowClick?.(customer)}
                      className="
                        w-full
                        text-left
                        font-medium
                        dark:text-white
                        rounded
                        hover:underline
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        focus:ring-offset-2
                        dark:focus:ring-offset-gray-800
                      "
                    >
                      {customer.name || "N/A"}
                    </button>
                  </td>

                  <td className="p-3 dark:text-gray-300">
                    {customer.email || "-"}
                  </td>

                  <td className="p-3 dark:text-gray-300">
                    {customer.phone || "-"}
                  </td>

                  <td className="p-3 dark:text-gray-300">
                    {customer.address || "-"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        customer.is_verified
                          ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-600 text-red-950 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {customer.is_verified
                        ? t("customers.verified.yes")
                        : t("customers.verified.no")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}