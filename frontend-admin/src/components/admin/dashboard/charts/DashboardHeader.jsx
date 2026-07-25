// frontend-admin/src/components/admin/dashboard/charts/DashboardHeader.jsx
import DashboardAnalyticsToolbar from "./DashboardAnalyticsToolbar";
import { useTranslation } from "react-i18next";


export default function DashboardHeader({
  title,
  period,
  periodMeta,
  onPeriodChange,
  darkMode,
  onToggleDarkMode,
  onExportPDF,
  exportingPDF,
  isMobile,
}) {

  const { t } = useTranslation();
  return (
    <div
      className="
    sticky
    top-0
    z-40

    bg-white/50
    dark:bg-gray-900/50

    backdrop-blur-xl

    border-b
    border-gray-200/50
    dark:border-gray-700/50

    shadow-sm
  "
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* TITLE + DARK MODE ONLY */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>

        
        </div>

        {/* GLOBAL ANALYTICS TOOLBAR */}
        <DashboardAnalyticsToolbar
          period={period}
          periodMeta={periodMeta}
          onPeriodChange={onPeriodChange}
          onExportPDF={onExportPDF}
          exportingPDF={exportingPDF}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
