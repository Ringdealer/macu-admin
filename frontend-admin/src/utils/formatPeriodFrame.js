//frontend-admin/src/utils/formatPeriodFrame.js
export function formatPeriodFrame({ period, periodMeta, i18n, t }) {
  if (!periodMeta) return "";

  if (period === "year") {
    return t("dashboard.period.yearLabel", {
      year: periodMeta.year,
    });
  }

  if (period === "month") {
    const date = new Date(periodMeta.year, periodMeta.month - 1);

    const locale = i18n?.language || "en";

    const monthName = date.toLocaleString(locale, {
      month: "long",
    });

    return t("dashboard.period.monthLabel", {
      month: monthName,
      year: periodMeta.year,
    });
  }

  if (period === "week") {
    const start = new Date(periodMeta.start);
    const end = new Date(periodMeta.end);

    const locale = i18n?.language || "en";

    const startText = start.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
    });

    const endText = end.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
    });

    return t("dashboard.period.weekLabel", {
      start: startText,
      end: endText,
    });
  }

  return "";
}
