// frontend-admin/src/components/admin/OrderTimeline.jsx
import { useTranslation } from "react-i18next";
import { ORDER_STATUSES } from "../../../config/orderConfig";

export default function OrderTimeline({ status }) {
  const { t } = useTranslation();

  const steps = ORDER_STATUSES;

  const labels = {
    pending: t("orders.timeline.pending"),
    confirmed: t("orders.timeline.confirmed"),
    packed: t("orders.timeline.packed"),
    shipped: t("orders.timeline.shipped"),
    in_transit: t("orders.timeline.in_transit"),
    delivered: t("orders.timeline.delivered"),
    returned: t("orders.timeline.returned"),
    cancelled: t("orders.timeline.cancelled"),
  };

  const currentIndex = Math.max(steps.indexOf(status), 0);
  const isTerminal = status === "cancelled" || status === "returned";

  const getDotColor = (step, index, isActive, isTerminalStep) => {
    if (isTerminalStep) return "bg-[#a4161a]";
    if (isActive) return "bg-[#40916c]";

    return "bg-gray-300 dark:bg-gray-600";
  };

  const getLineColor = () => {
    return "bg-gray-200 dark:bg-gray-700";
  };

  return (
    <div className="mt-4">
      {/* MOBILE + TABLET */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:hidden">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex && !isTerminal;
          const isTerminalStep = step === status;

          return (
            <div key={step} className="flex flex-col items-center text-center">
              <div
                className={`w-3 h-3 rounded-full ${getDotColor(
                  step,
                  index,
                  isActive,
                  isTerminalStep,
                )}`}
              />

              <span className="text-[11px] mt-1 leading-tight text-gray-800 dark:text-gray-300">
                {labels[step]}
              </span>
            </div>
          );
        })}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex justify-between items-start mt-2">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex && !isTerminal;
          const isTerminalStep = step === status;

          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`w-3 h-3 rounded-full ${getDotColor(
                  step,
                  index,
                  isActive,
                  isTerminalStep,
                )}`}
              />

              <span className="text-xs mt-1 text-center leading-tight text-gray-700 dark:text-gray-300">
                {labels[step]}
              </span>

              {index !== steps.length - 1 && (
                <div className={`h-[2px] w-full mt-2 ${getLineColor()}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
