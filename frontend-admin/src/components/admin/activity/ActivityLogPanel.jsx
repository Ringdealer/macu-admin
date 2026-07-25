//frontend-admin/src/components/admin/ActivityLogPanel.jsx
import { useEffect, useState } from "react";
import { getActivityLogs } from "../../../services/api";
import EmptyState from "../../ui/EmptyState";
import { useTranslation } from "react-i18next";

export default function ActivityLogPanel({ model, objectId }) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    try {
      setLoading(true);

      let params = [];
      if (model) params.push(`model=${model}`);
      if (objectId) params.push(`object_id=${objectId}`);

      const data = await getActivityLogs(params.join("&"));
      setLogs(data?.results || data || []);
    } catch (err) {
      console.error("Activity logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [model, objectId]);

  if (loading)
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      </div>
    );
  if (!logs.length) {
    return <EmptyState title={t("dashboard.noActivity")} />;
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {logs.map((log) => (
        <div
          key={log.id}
          className="border p-2 rounded text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {log.action}
            </span>

            <span className="text-gray-400 dark:text-gray-500">
              {new Date(log.created_at).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {log.description}
          </p>

          <div className="text-gray-400 dark:text-gray-500 mt-1">
            User: {log.user_email || "system"}
          </div>
        </div>
      ))}
    </div>
  );
}
