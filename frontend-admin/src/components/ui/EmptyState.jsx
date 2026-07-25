import { useTranslation } from "react-i18next";

export default function EmptyState({
  title,
  className = "",
  description,
  icon: Icon,
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400 ${className}`}
    >
      {Icon && <Icon className="h-10 w-10 mb-3 opacity-50" />}

      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {title || t("dashboard.noData")}
      </h3>

      {description && <p className="mt-2 text-xs max-w-sm">{description}</p>}
    </div>
  );
}
