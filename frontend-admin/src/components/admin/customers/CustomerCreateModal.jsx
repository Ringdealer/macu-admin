import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useTranslation } from "react-i18next";

export default function CustomerCreateModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const { t } = useTranslation();

  const countryOptions = [
    { code: "+1", label: "US (+1)" },
    { code: "+53", label: "CU (+53)" },
    { code: "+52", label: "MX (+52)" },
    { code: "+34", label: "ES (+34)" },
    { code: "+54", label: "AR (+54)" },
    { code: "+57", label: "CO (+57)" },
    { code: "+58", label: "VE (+58)" },
    { code: "+51", label: "PE (+51)" },
    { code: "+55", label: "BR (+55)" },
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country_code: "+1",
    address: "",
    password: "",
  });

  if (!isOpen) return null;

  const placeholders = {
    name: t("customers.fields.name"),
    email: t("customers.fields.email"),
    phone: t("customers.fields.phone"),
    address: t("customers.fields.address"),
    password: t("customers.fields.password"),
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onCreate(form);

    setForm({
      name: "",
      email: "",
      phone: "",
      country_code: "+1",
      address: "",
      password: "",
    });
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[10000]"
        onClose={onClose}
      >
        {/* BACKDROP */}
        <TransitionChild as={Fragment}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* WRAPPER */}
        <div className="fixed inset-0 flex items-center justify-center p-3 md:p-4">
          <TransitionChild as={Fragment}>
            <DialogPanel
              className="
                w-full
                max-w-md
                rounded-lg
                bg-white
                dark:bg-[#212529]
                dark:text-white
                p-4
                md:p-6
                shadow-xl
                space-y-3
              "
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <DialogTitle className="text-base md:text-lg font-bold">
                  {t("customers.create.title")}
                </DialogTitle>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              {/* FORM */}
              {["name", "email", "address", "password"].map((f) => (
                <input
                  key={f}
                  type={f === "password" ? "password" : "text"}
                  placeholder={placeholders[f]}
                  className="
                    w-full
                    border
                    p-2
                    rounded
                    text-sm
                    md:text-base
                    bg-white
                    dark:bg-[#343a40]
                    dark:text-white
                    border-gray-300
                    dark:border-gray-600
                  "
                  value={form[f]}
                  onChange={(e) => handleChange(f, e.target.value)}
                />
              ))}

              <div className="flex gap-2">
                <select
                  value={form.country_code}
                  onChange={(e) =>
                    handleChange("country_code", e.target.value)
                  }
                  className="
                    w-[130px]
                    border
                    p-2
                    rounded
                    text-sm
                    md:text-base
                    bg-white
                    dark:bg-[#343a40]
                    dark:text-white
                    border-gray-300
                    dark:border-gray-600
                  "
                >
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder={t("customers.fields.phone")}
                  className="
                    flex-1
                    border
                    p-2
                    rounded
                    text-sm
                    md:text-base
                    bg-white
                    dark:bg-[#343a40]
                    dark:text-white
                    border-gray-300
                    dark:border-gray-600
                  "
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 pt-2 text-sm md:text-base">
                <button
                  type="button"
                  onClick={onClose}
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
                  "
                >
                  {t("customers.create.cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="
                    px-4
                    py-2
                    rounded
                    bg-blue-600
                    text-white
                    hover:bg-blue-700
                  "
                >
                  {t("customers.create.create")}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}