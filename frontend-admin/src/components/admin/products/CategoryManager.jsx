import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/api";

import ConfirmDialog from "../../ui/ConfirmDialog";

export default function CategoryManager() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(null);
  const [isGroup, setIsGroup] = useState(true);
  const [editing, setEditing] = useState(null);
const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  // -------------------------
  // LOAD
  // -------------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();

      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      toast.error(t("categories.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // -------------------------
  // RESET FORM
  // -------------------------
  const resetForm = () => {
    setName("");
    setParentId(null);
    setIsGroup(true);
    setEditing(null);
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error(t("categories.nameRequired"));
      return;
    }

    const payload = {
      name: trimmedName,
      parent: isGroup ? null : parentId || null,
    };

    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.success(t("categories.updateSuccess"));
      } else {
        await createCategory(payload);
        toast.success(t("categories.createSuccess"));
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(t("categories.errorSave"));
    }
  };

  // -------------------------
  // EDIT
  // -------------------------
  const handleEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);

    const hasParent = !!cat.parent;

    setIsGroup(!hasParent);
    setParentId(hasParent ? cat.parent.id : null);
  };

  // -------------------------
  // DELETE
  // -------------------------
  const handleDelete = async () => {
  if (!deleteCategoryId) return;

  try {
    setLoading(true);

    await deleteCategory(deleteCategoryId);

    toast.success(t("categories.deleteSuccess"));

    fetchCategories();
  } catch (err) {
    console.error(err);

    toast.error(t("categories.errorDelete"));
  } finally {
    setLoading(false);
    setDeleteCategoryId(null);
  }
};

  // -------------------------
  // GROUPS + CHILDREN
  // -------------------------
  const groups = categories.filter((c) => !c.parent);
  const getChildren = (id) => categories.filter((c) => c.parent?.id === id);

  return (
    <div className="bg-white dark:bg-[#343a40] p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">{t("categories.manage")}</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("categories.name")}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
        />

        {/* CATEGORY TYPE */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isGroup}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsGroup(checked);
              if (checked) setParentId(null);
            }}
          />
          {t("categories.isGroup")}
        </label>

        {/* PARENT SELECT */}
        {!isGroup && (
          <select
            value={parentId ?? ""}
            onChange={(e) =>
              setParentId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">{t("categories.selectGroup")}</option>

            {groups
              .filter((g) => g.id !== editing?.id)
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
          </select>
        )}

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            {editing ? t("categories.edit") : t("categories.new")}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-3 py-2 rounded"
            >
              {t("common.cancel")}
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="border rounded p-3 dark:border-gray-600"
            >
              <div className="flex justify-between">
                <span className="font-bold">{group.name}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="px-2 py-1 text-sm bg-yellow-500 rounded"
                  >
                    {t("common.edit")}
                  </button>

                  <button
                    onClick={() => setDeleteCategoryId(group.id)}
                    className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>

              <div className="ml-6 mt-2 space-y-2">
                {getChildren(group.id).map((child) => (
                  <div key={child.id} className="flex justify-between text-sm">
                    <span>↳ {child.name}</span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(child)}
                        className="px-2 py-1 bg-yellow-500 rounded"
                      >
                        {t("common.edit")}
                      </button>

                      <button
                        onClick={() => setDeleteCategoryId(child.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
  isOpen={deleteCategoryId !== null}
  title={t("categories.delete")}
  message={t("categories.deleteConfirm")}
  confirmText={t("common.delete")}
  cancelText={t("common.cancel")}
  onConfirm={handleDelete}
  onCancel={() => setDeleteCategoryId(null)}
  confirmVariant="danger"
/>
    </div>
  );
}
