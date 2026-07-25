// frontend/src/components/admin/products/ProductModal.jsx
import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import ProductForm from "../../../pages/ProductForm";

export default function ProductModal({
  isOpen,
  editing,
  categories,
  onSubmit,
  onClose,
  t,
}) {
  if (!isOpen) return null;

  return (
  <Transition show={isOpen} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={onClose}
    >
      {/* Backdrop */}
      <TransitionChild as={Fragment}>
        <div className="fixed inset-0 bg-black/50" />
      </TransitionChild>

      {/* Wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild as={Fragment}>
          <DialogPanel
            className="
              w-full
              max-w-xl
              max-h-[90vh]
              overflow-y-auto
              rounded
              bg-white
              dark:bg-[#212529]
              dark:text-white
              p-6
              shadow-xl
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl font-bold">
                {editing ? t("products.edit") : t("products.new")}
              </DialogTitle>

              <button
                onClick={onClose}
                aria-label={t("common.close")}
                className="text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <ProductForm
              initialData={editing || {}}
              onSubmit={onSubmit}
              onCancel={onClose}
              categories={categories}
            />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </Transition>
);
}
