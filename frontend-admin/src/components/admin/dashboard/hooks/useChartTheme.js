// frontend-admin/src/components/admin/dashboard/hooks/useChartTheme.js
import { useEffect, useState } from "react";

export default function useChartTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const tooltipBg = isDark ? "#111827" : "#ffffff";
  const tooltipText = isDark ? "#f9fafb" : "#111827";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";

  return {
    isDark,

    // -------------------------
    // COLORS
    // -------------------------
    textColor: isDark ? "#f9fafb" : "#111827",
    axisColor,
    gridColor,

    tooltipBg,
    tooltipText,
    tooltipBorder,

    // -------------------------
    // RECHARTS STYLES
    // -------------------------
    tooltipStyle: {
      backgroundColor: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: "8px",
      color: tooltipText,
    },

    tooltipLabelStyle: {
      color: tooltipText,
    },

    tooltipItemStyle: {
      color: tooltipText,
    },

    axisTick: {
      fill: axisColor,
      fontSize: 12,
    },

    // -------------------------
    // DEFAULT ANIMATIONS
    // -------------------------
    animation: {
      isAnimationActive: true,
      animationDuration: 700,
      animationEasing: "ease-in-out",
    },
  };
}
