// utils/charts/formatYAxis.js

export function formatYAxis(type, currency = "$") {
  switch (type) {
    case "currency":
      return (value) =>
        `${currency}${Number(value).toLocaleString()}`;

    case "integer":
      return (value) => Math.round(value);

    case "percent":
      return (value) => `${value}%`;

    default:
      return (value) => value;
  }
}