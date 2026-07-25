import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const confirmClasses =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
  as="div"
  className="relative z-[10000]"
  onClose={loading ? () => {} : onCancel}
>
        {/* Backdrop */}
        <TransitionChild as={Fragment}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* Wrapper */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as={Fragment}>
            <DialogPanel
              className="
                w-full
                max-w-md
                rounded-lg
                bg-white
                dark:bg-gray-900
                text-gray-900
                dark:text-white
                shadow-xl
                border
                border-gray-200
                dark:border-gray-700
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
                <DialogTitle className="text-lg font-semibold">
                  {title}
                </DialogTitle>

                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={onCancel}
                  disabled={loading}
                  className="
                    text-gray-500
                    hover:text-red-500
                    disabled:opacity-50
                  "
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div
                className="
                  flex
                  justify-end
                  gap-2
                  border-t
                  border-gray-200
                  dark:border-gray-700
                  p-4
                "
              >
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="
                    px-4
                    py-2
                    rounded
                    bg-gray-200
                    text-gray-800
                    hover:bg-gray-300
                    dark:bg-gray-700
                    dark:text-white
                    dark:hover:bg-gray-600
                    disabled:opacity-50
                  "
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={`
                    px-4
                    py-2
                    rounded
                    transition
                    disabled:opacity-50
                    ${confirmClasses}
                  `}
                >
                  {loading
                    ? t("common.loading")
                    : confirmText}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}