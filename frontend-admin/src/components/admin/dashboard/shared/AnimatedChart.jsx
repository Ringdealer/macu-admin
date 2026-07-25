import { useEffect, useState } from "react";

export default function AnimatedChart({ trigger, children }) {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    setPhase("out");

    const timer = setTimeout(() => {
      setPhase("in");
    }, 80);

    return () => clearTimeout(timer);
  }, [trigger]);

  const animation =
    phase === "out"
      ? "opacity-70 scale-[0.985] blur-[1px]"
      : "opacity-100 scale-100 blur-0";

  return (
    <div
      className={`
        transform-gpu
        transition-all
        duration-300
        ease-out
        ${animation}
      `}
    >
      {children}
    </div>
  );
}
