export default function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  className = "",
}) {
  const indicator =
    sortConfig.key !== sortKey
      ? " ↕"
      : sortConfig.direction === "asc"
        ? " ↑"
        : " ↓";

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`p-3 text-left whitespace-nowrap cursor-pointer select-none ${className}`}
    >
      {label}
      {indicator}
    </th>
  );
}