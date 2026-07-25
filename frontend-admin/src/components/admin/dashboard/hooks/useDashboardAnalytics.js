//frontend-admin/src/components/admin/dashboard/hooks/useDashboardAnalytics.js
/**
 * useDashboardAnalytics
 * Centralized analytics engine for Admin Dashboard
 */
import { useMemo } from "react";

export default function useDashboardAnalytics(orders, t = (x) => x) {
  return useMemo(() => {
    if (!orders?.length) {
      return {
        ordersByDate: [],
        statusData: [],
        customersByDate: [],
        topProducts: [],
        revenueToday: 0,
        revenueWeek: 0,
        revenueMonth: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        ordersChangePct: 0,
        revenueChangePct: 0,
        ordersTrendUp: true,
        revenueTrendUp: true,
        categoryRevenueOverTime: [],
        categoryRevenueOverTimeMonth: [],
        categoryRevenueOverTimeWeek: [],
      };
    }

    // -------------------------
    // DATE HELPERS
    // -------------------------
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // -------------------------
    // BASIC STATS
    // -------------------------
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    // -------------------------
    // REVENUE BREAKDOWN
    // -------------------------
    const revenueToday = orders
      .filter((o) => new Date(o.created_at) >= startOfDay)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueWeek = orders
      .filter((o) => new Date(o.created_at) >= startOfWeek)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueMonth = orders
      .filter((o) => new Date(o.created_at) >= startOfMonth)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // -------------------------
    // LAST 24H ANALYTICS
    // -------------------------
    const last24h = orders.filter(
      (o) =>
        new Date(o.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000),
    );

    const prev24h = orders.filter(
      (o) =>
        new Date(o.created_at) <
          new Date(now.getTime() - 24 * 60 * 60 * 1000) &&
        new Date(o.created_at) >= new Date(now.getTime() - 48 * 60 * 60 * 1000),
    );

    const ordersChangePct =
      prev24h.length === 0
        ? 100
        : ((last24h.length - prev24h.length) / prev24h.length) * 100;

    const revenueLast24h = last24h.reduce((sum, o) => sum + (o.total || 0), 0);

    const revenuePrev24h = prev24h.reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueChangePct =
      revenuePrev24h === 0
        ? 100
        : ((revenueLast24h - revenuePrev24h) / revenuePrev24h) * 100;

    const ordersTrendUp = ordersChangePct >= 0;
    const revenueTrendUp = revenueChangePct >= 0;

    // -------------------------
    // ORDERS BY DATE (LINE CHART)
    // -------------------------
    const ordersByDate = Object.values(
      orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();

        if (!acc[date]) {
          acc[date] = {
            date,
            pedidos: 0,
            ingresos: 0,
          };
        }

        acc[date].pedidos += 1;
        acc[date].ingresos += order.total || 0;

        return acc;
      }, {}),
    );

    // -------------------------
    // STATUS DATA (PIE CHART)
    // -------------------------
    const statusData = Object.values(
      orders.reduce((acc, order) => {
        const status = order.status;

        const allowed = ["cancelled", "returned", "delivered"];

        if (!allowed.includes(status)) return acc;

        if (!acc[status]) {
          acc[status] = {
            key: status,
            value: 0,
          };
        }

        acc[status].value += 1;

        return acc;
      }, {}),
    );

    // -------------------------
    // CUSTOMERS BY DATE
    // -------------------------
    const customersByDate = Object.values(
      orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();

        if (!acc[date]) {
          acc[date] = {
            date,
            clientes: new Set(),
          };
        }

        acc[date].clientes.add(order.customer_id);

        return acc;
      }, {}),
    ).map((d) => ({
      date: d.date,
      clientes: d.clientes.size,
    }));

    // -------------------------
    // TOP PRODUCTS
    // -------------------------
    const topProducts = Object.values(
      orders
        .flatMap((o) => o.order_items || [])
        .reduce((acc, item) => {
          const id = item.product;

          if (!acc[id]) {
            acc[id] = {
              name: item.product_name || t("dashboard.common.unknown"),
              qty: 0,
            };
          }

          acc[id].qty += Number(item.quantity || 0);

          return acc;
        }, {}),
    )
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    /// -------------------------
    // PRODUCTS SALES TREND
    // -------------------------

    const topSellingProducts = (() => {
      const dates = {};

      orders.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString();

        if (!dates[date]) {
          dates[date] = { date };
        }

        (order.order_items || []).forEach((item) => {
          const productName =
            item.product_name ||
            item.product?.name ||
            t("dashboard.common.unknown");

          if (!dates[date][productName]) {
            dates[date][productName] = 0;
          }

          dates[date][productName] += Number(item.quantity || 0);
        });
      });

      return Object.values(dates).sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
    })();

    // -------------------------
    // CATEGORY REVENUE OVER TIME
    // -------------------------

    const buildCategoryRevenueOverTime = (periodFormatter) => {
      const periods = {};

      orders.forEach((order) => {
        const period = periodFormatter(new Date(order.created_at));

        if (!periods[period]) {
          periods[period] = {
            period,
          };
        }

        (order.order_items || []).forEach((item) => {
          const category =
            item.root_category?.name ||
            item.category?.name ||
            t("dashboard.common.unknown");

          const revenue =
            Number(item.product_price || 0) * Number(item.quantity || 0);

          periods[period][category] =
            (periods[period][category] || 0) + revenue;
        });
      });

      return Object.values(periods).map((p) => ({
        ...p,
        period: p.period,
      }));
    };

    const categoryRevenueOverTimeYear = buildCategoryRevenueOverTime((date) =>
      date.getFullYear().toString(),
    );

    const categoryRevenueOverTimeMonth = buildCategoryRevenueOverTime((date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    );

    const categoryRevenueOverTimeWeek = buildCategoryRevenueOverTime((date) => {
      const d = new Date(date);

      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());

      return `Week ${startOfWeek.getFullYear()}-${String(
        startOfWeek.getMonth() + 1,
      ).padStart(2, "0")}-${String(startOfWeek.getDate()).padStart(2, "0")}`;
    });

    return {
      ordersByDate,
      statusData,
      customersByDate,
      topProducts,
      revenueToday,
      revenueWeek,
      revenueMonth,
      totalOrders,
      totalRevenue,
      pendingOrders,
      ordersChangePct,
      revenueChangePct,
      ordersTrendUp,
      revenueTrendUp,
      topSellingProducts,
      categoryRevenueOverTimeYear,
      categoryRevenueOverTimeMonth,
      categoryRevenueOverTimeWeek,
    };
  }, [orders, t]);
}
