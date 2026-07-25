import { useTranslation } from "react-i18next";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export default function DashboardAnalyticsToolbar({
  period,
  onPeriodChange,
  onExportPDF,
  exportingPDF,
  isMobile,
}) {
  const { t } = useTranslation();
  const periods = [
    { value: "year", label: t("dashboard.filters.year") },
    { value: "month", label: t("dashboard.filters.month") },
    { value: "week", label: t("dashboard.filters.week") },
  ];

  return (
    <div
      className="
    relative

    bg-white/50
    dark:bg-gray-900/50

    backdrop-blur-xl

    border-b
    border-gray-200/50
    dark:border-gray-700/50

    shadow-sm
    rounded-xl
  "
    >
      <div
        className="
    w-full
    max-w-screen-xl
    mx-auto
    px-4
    sm:px-6
    lg:px-8
    py-3
  "
      >
        <div
          className="
      flex
      items-center
      justify-between
      gap-2
      w-full
    "
        >
          {/* PERIOD BUTTONS */}
          <div
            className="
        flex
        items-center
        gap-1
        p-1
        bg-gray-100
        dark:bg-gray-800
        rounded-lg
        shadow
        shrink-0
      "
          >
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPeriodChange(p.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  period === p.value
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* EXPORT BUTTON */}
         {isMobile ? (
  <Tippy
    content={t("dashboard.pdf.desktopOnly")}
    placement="left"
    arrow={true}
  >
    <div>
      <button
        type="button"
        disabled
        className="
          px-3
          py-1.5
          text-sm
          font-medium
          rounded-md
          shadow-sm
          whitespace-nowrap

          bg-gray-300
          dark:bg-gray-700

          text-gray-500
          dark:text-gray-400

          cursor-not-allowed
          opacity-70
        "
      >
        {t("dashboard.exportPdfShort")}
      </button>
    </div>
  </Tippy>
) : (
  <button
    type="button"
    onClick={onExportPDF}
    disabled={exportingPDF}
    className="
      px-3
      py-1.5
      text-sm
      font-medium
      rounded-md
      shadow-sm
      transition
      whitespace-nowrap
      shrink-0

      bg-blue-600
      text-white
      hover:bg-blue-700

      dark:bg-blue-500
      dark:hover:bg-blue-600

      disabled:opacity-60
      disabled:cursor-not-allowed
    "
  >
    {exportingPDF ? (
      <>
        <span className="hidden sm:inline">
          {t("dashboard.exportingPdf")}
        </span>
        <span className="sm:hidden">
          {t("dashboard.exportingPdfShort")}
        </span>
      </>
    ) : (
      <>
        <span className="hidden sm:inline">
          {t("dashboard.exportPdf")}
        </span>
        <span className="sm:hidden">
          {t("dashboard.exportPdfShort")}
        </span>
      </>
    )}
  </button>
)}
        </div>
      </div>
    </div>
  );
}
