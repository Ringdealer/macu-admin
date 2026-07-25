import { useTranslation } from "react-i18next";

/**
 * Reusable pagination component for DRF-style pagination
 *
 * Props:
 * - page: current page number
 * - setPage: function to update page
 * - next: URL or null
 * - previous: URL or null
 * - loading: optional disable state
 */
export default function Pagination({
  page,
  setPage,
  next,
  previous,
  loading = false,
}) {
  const { t } = useTranslation();

  const goNext = () => {
    if (next && !loading) {
      setPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (previous && page > 1 && !loading) {
      setPage((p) => p - 1);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={goPrev}
        disabled={!previous || loading}
        className={`px-4 py-2 rounded transition border ${
          previous && !loading
            ? `
              bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600
            `
            : `
              bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200
              dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700
            `
        }`}
      >
        {t("pagination.previous")}
      </button>

      <span className="text-sm text-gray-600 dark:text-gray-300">
        {t("pagination.page")} {page}
      </span>

      <button
        onClick={goNext}
        disabled={!next || loading}
        className={`px-4 py-2 rounded transition border ${
          next && !loading
            ? `
              bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600
            `
            : `
              bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200
              dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700
            `
        }`}
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}
