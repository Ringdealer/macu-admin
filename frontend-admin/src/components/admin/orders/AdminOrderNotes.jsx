import { useEffect, useState } from "react";
import {
  getOrderNotes,
  createOrderNote,
  updateOrderNote,
  deleteOrderNote,
} from "../../../services/api";
import { useTranslation } from "react-i18next";
import EmptyState from "../../ui/EmptyState";
import { HiPencil, HiTrash, HiCheck, HiX } from "react-icons/hi";
import toast from "react-hot-toast";

export default function AdminOrderNotes({ orderId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetchNotes = async () => {
    try {
      setNotesLoading(true);

      const data = await getOrderNotes(orderId);
      setNotes(data?.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const addNote = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      await createOrderNote({
        order: orderId,
        note: text.trim(),
      });

      toast.success(t("orders.notes.created"));

      setText("");
      fetchNotes();
    } catch (err) {
      console.error(err);
      toast.error(t("orders.notes.createError"));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (note) => {
    

    setEditingId(note.id);
    setEditText(note.note || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      toast.error(t("orders.notes.emptyError"));
      return;
    }

    try {
      await updateOrderNote(editingId, {
        note: editText.trim(),
      });

      toast.success(t("orders.notes.updated"));

      setEditingId(null);
      setEditText("");

      fetchNotes();
    } catch (err) {
      console.error(err);
      toast.error(t("orders.notes.updateError"));
    }
  };

  const removeNote = async (id) => {
    const toastId = toast.loading(t("orders.notes.deleting"));

    try {
      await deleteOrderNote(id);

      toast.success(t("orders.notes.deleted"), {
        id: toastId,
      });

      fetchNotes();
    } catch (err) {
      console.error(err);

      toast.error(t("orders.notes.deleteError"), {
        id: toastId,
      });
    }
  };

  useEffect(() => {
    if (orderId) fetchNotes();
  }, [orderId]);

  return (
    <div className="border-t pt-4 mt-4 border-gray-300 dark:border-gray-700">
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
        {t("orders.notes.title")}
      </h3>

      <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
        {notesLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState title={t("orders.notes.empty")} />
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="p-2 rounded text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              {editingId === n.id ? (
                <>
                  <textarea
                    autoFocus
                    className="
                      w-full
                      border
                      p-2
                      rounded
                      bg-white
                      dark:bg-gray-900
                      text-gray-900
                      dark:text-gray-100
                    "
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveEdit}
                      className="
                        p-2
                        rounded
                        bg-green-600
                        text-white
                        hover:bg-green-700
                      "
                      title={t("orders.notes.save")}
                    >
                      <HiCheck />
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="
                        p-2
                        rounded
                        bg-gray-500
                        text-white
                        hover:bg-gray-600
                      "
                      title={t("orders.notes.cancel")}
                    >
                      <HiX />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{n.note}</p>

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {n.created_by_name || "Admin"} ·{" "}
                      {new Date(n.created_at).toLocaleString()}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(n)}
                        className="
                          p-1
                          rounded
                          text-blue-600
                          dark:text-blue-400
                          hover:bg-blue-100
                          dark:hover:bg-blue-900/30
                          transition-colors
                        "
                        title={t("orders.notes.edit")}
                      >
                        <HiPencil size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteId(n.id)}
                        aria-label={t("orders.notes.delete")}
                        title={t("orders.notes.delete")}
                        className="
                          p-1.5
                          rounded-lg
                          text-red-600
                          dark:text-red-400
                          hover:bg-red-100
                          dark:hover:bg-red-900/30
                          transition-colors
                        "
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <textarea
        className="w-full border p-2 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        placeholder={t("orders.notes.placeholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={addNote}
        disabled={loading}
        className="mt-2 bg-black dark:bg-gray-700 text-white px-3 py-1 rounded text-sm hover:opacity-90"
      >
        {t("orders.notes.add")}
      </button>

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/50
          "
        >
          <div
            className="
              w-80
              rounded-lg
              bg-white
              dark:bg-gray-800
              p-5
              shadow-xl
            "
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("orders.notes.confirmDelete")}
            </h3>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="
                  px-3
                  py-1
                  rounded
                  bg-gray-200
                  dark:bg-gray-700
                  text-gray-900
                  dark:text-white
                "
              >
                {t("common.cancel")}
              </button>

              <button
                onClick={() => {
                  removeNote(deleteId);
                  setDeleteId(null);
                }}
                className="
                  px-3
                  py-1
                  rounded
                  bg-red-600
                  text-white
                "
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}