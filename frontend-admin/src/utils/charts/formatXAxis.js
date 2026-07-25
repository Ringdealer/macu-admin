export function formatXAxisByPeriod(period, i18n) {
  return (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    switch (period) {
      case "year":
        return date.toLocaleString(i18n.language, {
          month: "short",
        });

      case "month":
        return date.getDate();

      case "week":
        return date.toLocaleString(i18n.language, {
          weekday: "short",
        });

      default:
        return value;
    }
  };
}