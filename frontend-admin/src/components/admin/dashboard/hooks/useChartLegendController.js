import { useEffect, useMemo, useState } from "react";

export default function useChartLegendController(categories = [], colors = []) {
  const [isMobile, setIsMobile] = useState(false);
  const [hiddenKeys, setHiddenKeys] = useState(new Set());
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleCategory = (key) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const reset = () => setHiddenKeys(new Set());

  const visibleCategories = useMemo(
    () => categories.filter((c) => !hiddenKeys.has(c)),
    [categories, hiddenKeys],
  );

  const legendItems = useMemo(() => {
    return categories.map((cat, index) => ({
      key: cat,
      color: colors[index % colors.length],
      hidden: hiddenKeys.has(cat),
    }));
  }, [categories, colors, hiddenKeys]);

  return {
    isMobile,
    legendOpen,
    setLegendOpen,

    hiddenKeys,
    toggleCategory,
    reset,

    visibleCategories,
    legendItems,
  };
}
