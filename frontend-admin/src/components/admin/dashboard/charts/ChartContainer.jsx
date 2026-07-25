// components/admin/dashboard/charts/ChartContainer.jsx
export default function ChartContainer({ period, children }) {
  return (
    <div
      key={period}
      className="
                transition-opacity
                duration-300
                ease-in-out
            "
    >
      {children}
    </div>
  );
}
