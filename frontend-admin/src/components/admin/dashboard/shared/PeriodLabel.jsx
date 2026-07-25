// frontend-admin/src/components/admin/dashboard/shared/PeriodLabel.jsx
import { useEffect, useState } from "react";

export default function PeriodLabel({ label }) {
  const [displayLabel, setDisplayLabel] = useState(label);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (label === displayLabel) return;

    setVisible(false);

    const timer = setTimeout(() => {
      setDisplayLabel(label);
      setVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [label, displayLabel]);

  return (
    <p
      className={`
        text-xs
        text-gray-500
        dark:text-gray-400
        mb-2
        transition-all
        duration-300
        ease-in-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
      `}
    >
      {displayLabel}
    </p>
  );
}
