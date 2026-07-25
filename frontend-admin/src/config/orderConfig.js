// frontend-admin/src/config/orderConfig.js

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "in_transit",
  "delivered",
  "returned",
  "cancelled",
];

export const PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "failed",
];

// (Orders) Label keys (i18n mapping)

export const getOrderStatusLabelKey = (status) =>
  `orders.status.${status}`;

export const getPaymentStatusLabelKey = (status) =>
  `orders.payment.${status}`;