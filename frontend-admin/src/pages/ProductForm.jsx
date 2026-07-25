// frontend/src/pages/admin/ProductForm.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProductForm({
  onSubmit,
  onCancel,
  initialData = {},
  categories = [],
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(initialData.price || "");
      setStock(initialData.stock || "");
      setCategory(initialData.category?.id || "");
      setDescription(initialData.description || "");
      setCharacteristics(initialData.characteristics?.description || "");
      setOriginCountry(initialData.origin_country || "");

      if (initialData.image || initialData.image_url) {
        setPreview(initialData.image || initialData.image_url);
      }
    }
  }, [initialData]);

  const convertToWebP = (file, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("WebP conversion failed"));
              return;
            }

            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              {
                type: "image/webp",
              },
            );

            resolve(webpFile);
          },
          "image/webp",
          quality,
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const webpFile = await convertToWebP(file, 0.8);

      setImage(webpFile);
      setPreview(URL.createObjectURL(webpFile));
    } catch (err) {
      console.error("WebP conversion failed:", err);

      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (price === "" || Number(price) < 0) {
      newErrors.price = t("products.validation.priceMin");
    }

    if (stock === "" || Number(stock) < 0) {
      newErrors.stock = t("products.validation.stockMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);

    if (category) {
      formData.append("category", Number(category));
    }
    if (description) formData.append("description", description);

    if (characteristics) {
      formData.append(
        "characteristics",
        JSON.stringify({ description: characteristics }),
      );
    }

    if (originCountry) formData.append("origin_country", originCountry);

    if (image) formData.append("image", image);

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6 text-sm md:text-base text-gray-900 dark:text-gray-100"
    >
      {/* BASIC INFO */}
      <div className="space-y-2 md:space-y-3">
        <h3 className="text-base md:text-lg font-semibold">
          {t("products.form.basicInfo")}
        </h3>

        <div>
          <label
            htmlFor="product-name"
            className="block text-xs md:text-sm font-medium mb-1"
          >
            {t("products.form.productName")}
          </label>

          <input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded
                       bg-white dark:bg-gray-800
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="product-category"
            className="block text-xs md:text-sm font-medium mb-1"
          >
            {t("products.form.category")}
          </label>

          <select
            id="product-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 w-full rounded
                       bg-white dark:bg-gray-800
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100"
          >
            <option value="">{t("products.form.noCategory")}</option>

            {(Array.isArray(categories) ? categories : [])
              .filter((c) => c.parent !== null)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label
          htmlFor="product-description"
          className="block text-xs md:text-sm font-medium mb-1"
        >
          {t("products.form.description")}
        </label>

        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded
                     bg-white dark:bg-gray-800
                     border-gray-300 dark:border-gray-600
                     text-gray-900 dark:text-gray-100"
          rows={4}
        />
      </div>

      {/* CHARACTERISTICS */}
      <div>
        <label
          htmlFor="product-characteristics"
          className="block text-xs md:text-sm font-medium mb-1"
        >
          {t("products.form.characteristics")}
        </label>

        <textarea
          id="product-characteristics"
          value={characteristics}
          onChange={(e) => setCharacteristics(e.target.value)}
          className="border p-2 w-full rounded
                     bg-white dark:bg-gray-800
                     border-gray-300 dark:border-gray-600
                     text-gray-900 dark:text-gray-100"
          rows={4}
        />
      </div>

      {/* ORIGIN */}
      <div>
        <label
          htmlFor="product-origin-country"
          className="block text-xs md:text-sm font-medium mb-1"
        >
          {t("products.form.originCountry")}
        </label>

        <input
          id="product-origin-country"
          value={originCountry}
          onChange={(e) => setOriginCountry(e.target.value)}
          className="border p-2 w-full rounded
                     bg-white dark:bg-gray-800
                     border-gray-300 dark:border-gray-600
                     text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* PRICE + STOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <div>
          <label
            htmlFor="product-price"
            className="block text-xs md:text-sm font-medium mb-1"
          >
            {t("products.form.price")}
          </label>

          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 w-full rounded
                       bg-white dark:bg-gray-800
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100"
          />

          {errors.price && (
            <p className="text-red-500 text-xs md:text-sm">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-stock"
            className="block text-xs md:text-sm font-medium mb-1"
          >
            {t("products.form.stock")}
          </label>

          <input
            id="product-stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border p-2 w-full rounded
                       bg-white dark:bg-gray-800
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100"
          />

          {errors.stock && (
            <p className="text-red-500 text-xs md:text-sm">{errors.stock}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-1">
          {t("products.form.image")}
        </label>

        <label
          htmlFor="product-image"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("product-image")?.click();
            }
          }}
          className="
    border p-2 w-full rounded
    flex items-center justify-between
    cursor-pointer
    bg-white dark:bg-gray-800
    border-gray-300 dark:border-gray-600
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-2
  "
        >
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {image?.name ||
              (preview
                ? t("products.form.imageSelected")
                : t("products.form.chooseImage"))}
          </span>

          <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm">
            {t("products.form.browse")}
          </span>

          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded border mt-2 border-gray-300 dark:border-gray-600"
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm md:text-base py-2 md:py-0"
        >
          {t("products.cancel")}
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 md:px-5 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
        >
          {t("products.save")}
        </button>
      </div>
    </form>
  );
}
