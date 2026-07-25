// frontend-admin/src/components/admin/Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";
import {
  HiMoon,
  HiSun,
  HiOutlineHome,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineGlobeAlt,
} from "react-icons/hi";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const activeClass = "bg-blue-600 text-white shadow-sm";
  const inactiveClass =
    "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  const linkClass = (collapsed) =>
  `flex items-center rounded-lg transition-all duration-200 ${
    collapsed
      ? "justify-center px-2 py-2 md:py-3"
      : "gap-3 px-3 md:px-4 py-2"
  }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const PUBLIC_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5173"
      : "https://macu-frontend.onrender.com";

  const { darkMode, toggleDarkMode } = useTheme();
  const sidebarCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* OVERLAY (mobile only) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-60 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
  className={`
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    shadow-md dark:shadow-black/30
    border-r border-gray-200 dark:border-gray-700
    p-3 md:p-4
    flex flex-col
    transition-all duration-300
    z-50
    fixed md:static top-0 left-0 h-full

    ${sidebarCollapsed ? "md:w-16" : "w-60 md:w-64"}

    md:translate-x-0
    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          {!sidebarCollapsed && (
            <h2 className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400">
              Admin
            </h2>
          )}

          {/* DESKTOP COLLAPSE BUTTON */}
          <button
            onClick={() => setCollapsed(!sidebarCollapsed)}
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            className="
         w-12 h-10   
    p-1 rounded
    hover:bg-gray-100 dark:hover:bg-gray-700
    hidden md:block
    text-gray-700 dark:text-gray-200
    transition
  "
          >
            {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
          </button>

          {/* MOBILE CLOSE BUTTON */}
          <button
            onClick={() => setMobileOpen(false)}
            className="
              md:hidden text-xl
              text-gray-700 dark:text-gray-200
            "
          >
            ✕
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1 md:gap-2 text-sm md:text-base">
          <NavLink
            to="/admin"
            end
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${linkClass(sidebarCollapsed)} ${
                isActive ? activeClass : inactiveClass
              }`
            }
          >
            <HiOutlineHome className="text-lg md:text-xl shrink-0" />
            {!sidebarCollapsed && <span>{t("sidebar.dashboard")}</span>}
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${linkClass(sidebarCollapsed)} ${
                isActive ? activeClass : inactiveClass
              }`
            }
          >
            <HiOutlineShoppingCart className="text-lg md:text-xl shrink-0" />
            {!sidebarCollapsed && <span>{t("sidebar.orders")}</span>}
          </NavLink>

          <NavLink
            to="/admin/products"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${linkClass(sidebarCollapsed)} ${
                isActive ? activeClass : inactiveClass
              }`
            }
          >
            <HiOutlineCube className="text-lg md:text-xl shrink-0" />
            {!sidebarCollapsed && <span>{t("sidebar.products")}</span>}
          </NavLink>

          <NavLink
            to="/admin/customers"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${linkClass(sidebarCollapsed)} ${
                isActive ? activeClass : inactiveClass
              }`
            }
          >
            <HiOutlineUsers className="text-lg md:text-xl shrink-0" />
            {!sidebarCollapsed && <span>{t("sidebar.customers")}</span>}
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="mt-auto pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`
              flex items-center rounded-lg w-full
              text-red-600 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900/30
              transition-all duration-200
              ${
                sidebarCollapsed
                  ? "justify-center px-2 py-2 md:py-3"
                  : "gap-3 px-3 md:px-4 py-2"
              }
            `}
          >
            <HiOutlineLogout className="text-lg md:text-xl shrink-0" />
            {!sidebarCollapsed && <span>{t("sidebar.logout")}</span>}
          </button>
        </div>

      {/* DARK MODE */}
<div className="mt-4 flex justify-center">
  {sidebarCollapsed ? (
    <button
      onClick={toggleDarkMode}
      aria-label={
        darkMode
          ? t("dashboard.actions.lightMode")
          : t("dashboard.actions.darkMode")
      }
      title={
        darkMode
          ? t("dashboard.actions.lightMode")
          : t("dashboard.actions.darkMode")
      }
      className="
        w-8 h-8
        flex items-center justify-center
        rounded-lg
        bg-white dark:bg-gray-700
        shadow
        hover:shadow-md
        transition
        text-gray-800 dark:text-white
      "
    >
      {darkMode ? <HiSun size={16} /> : <HiMoon size={16} />}
    </button>
  ) : (
    <button
      onClick={toggleDarkMode}
      aria-label={
        darkMode
          ? t("dashboard.actions.lightMode")
          : t("dashboard.actions.darkMode")
      }
      title={
        darkMode
          ? t("dashboard.actions.lightMode")
          : t("dashboard.actions.darkMode")
      }
      className="
        relative
        w-14
        h-7
        rounded-full
        bg-gray-300
        dark:bg-gray-700
        transition-colors
        duration-300
        shadow-inner
      "
    >
      <span
        className={`
          absolute
          top-1
          left-1
          w-5
          h-5
          rounded-full
          bg-white
          shadow-md
          flex
          items-center
          justify-center
          transition-transform
          duration-300
          ${
            darkMode
              ? "translate-x-7"
              : "translate-x-0"
          }
        `}
      >
        {darkMode ? (
          <HiSun size={14} className="text-gray-700" />
        ) : (
          <HiMoon size={14} className="text-gray-700" />
        )}
      </span>
    </button>
  )}
</div>

        {/* LANGUAGE SWITCHER */}
        <div className="mt-4 md:mt-6 flex justify-center gap-2">
          <button
            onClick={() => i18n.changeLanguage("es")}
            className="
              px-2 py-1 text-xs rounded border
              border-gray-300 dark:border-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-700
              text-gray-700 dark:text-gray-200
              transition
            "
          >
            ES
          </button>

          <button
            onClick={() => i18n.changeLanguage("en")}
            className="
              px-2 py-1 text-xs rounded border
              border-gray-300 dark:border-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-700
              text-gray-700 dark:text-gray-200
              transition
            "
          >
            EN
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          {!sidebarCollapsed && (
            <>
              {/* PUBLIC SITE */}
              <a
                href={PUBLIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
    flex items-center justify-center gap-2
    text-sm text-blue-600 dark:text-blue-400
    hover:underline
    mb-3
  "
              >
                <HiOutlineGlobeAlt className="text-base" />
                <span>{t("sidebar.publicSite")}</span>
              </a>

              {/* ADMIN USER */}
              <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username || user.email}
              </div>

              {/* VERSION */}
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                v1.0 Admin
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
