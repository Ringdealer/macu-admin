import { useState } from "react";
import { useTranslation } from "react-i18next";
import { login, getCurrentUser } from "../services/authService";

export default function Login() {
  const [userInput, setUserInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await login(userInput, password);

      const token = data.key || data.token;
      if (!token) throw new Error("No token returned");

      localStorage.setItem("token", token);

      const user = await getCurrentUser(token);

      if (!user.is_staff) {
        throw new Error("Not admin user");
      }

      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error(err);
      setError(t("auth.loginError"));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              {t("auth.adminLoginTitle")}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              {t("auth.adminLoginSubtitle")}
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {t("auth.usernameOrEmail")}
                </label>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  placeholder={t("auth.usernameOrEmailPlaceholder")}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  {t("auth.password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  placeholder={t("auth.passwordPlaceholder")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {loading ? t("auth.loggingIn") : t("auth.loginButton")}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          {t("auth.onlyAuthorized")}
        </p>
      </div>
    </div>
  );
}
