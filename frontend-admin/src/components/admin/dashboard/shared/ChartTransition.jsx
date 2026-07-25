// frontend-admin/src/components/admin/dashboard/shared/ChartTransition.jsx
import { useEffect, useState } from "react";

export default function ChartTransition({ trigger, children }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);

    const timer = setTimeout(() => {
      setVisible(true);
    }, 80);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div
      className={`
        transition-all
        duration-300
        ease-in-out
        ${visible ? "opacity-100 scale-100" : "opacity-40 scale-[0.985]"}
      `}
    >
      {children}
    </div>
  );
}
