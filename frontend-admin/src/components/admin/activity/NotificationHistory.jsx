// frontend/src/components/admin/NotificationHistory.jsx
import { useEffect, useState } from "react";
import {
  getOrderNotifications,
  retryNotification,
} from "../../../services/api";
import EmptyState from "../../ui/EmptyState";
import { useTranslation } from "react-i18next";

export default function NotificationHistory({ orderId }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getOrderNotifications(orderId);
      setNotifications(data?.results || data || []);
    } catch (err) {
      console.error("Notification load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      setRetryingId(id);
      await retryNotification(id);
      await loadNotifications();
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetryingId(null);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    loadNotifications();
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      </div>
    );
  }

  if (!notifications.length) {
    return <EmptyState title={t("dashboard.noNotifications")} />;
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="border p-2 rounded text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
              {n.type}
            </span>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mt-1">{n.message}</p>

          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-xs font-semibold ${
                n.status === "sent"
                  ? "text-green-600"
                  : n.status === "failed"
                    ? "text-red-500"
                    : "text-yellow-500"
              }`}
            >
              {n.status}
            </span>

            {n.status === "failed" && (
              <button
                onClick={() => handleRetry(n.id)}
                disabled={retryingId === n.id}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {retryingId === n.id ? "Retrying..." : "Retry"}
              </button>
            )}
          </div>

          {n.status === "failed" && n.response && (
            <p className="text-red-500 text-xs mt-1">Error: {n.response}</p>
          )}
        </div>
      ))}
    </div>
  );
}
