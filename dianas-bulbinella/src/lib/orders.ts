/** Order status vocabulary — shared by the admin fulfilment screens, the
 *  customer's order history, and invoices. */

export type OrderStatus =
  | "received"
  | "paid"
  | "completed"
  | "shipped"
  | "collected"
  | "cancelled";

/** Diana-facing wording for each status. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order received",
  paid: "Payment received",
  completed: "Order completed",
  shipped: "Shipped",
  collected: "Collected",
  cancelled: "Cancelled",
};

/** Still needs attention — shown under "Current orders". */
export const ACTIVE_STATUSES: OrderStatus[] = ["received", "paid", "completed"];

/** Fulfilled and done — shown under "Completed orders". */
export const DONE_STATUSES: OrderStatus[] = ["shipped", "collected"];

/** Orders whose money has landed — the only ones that count towards revenue,
 *  customer spend and the monthly report. Mirrors isPaid() as a query filter. */
export const PAID_STATUSES: OrderStatus[] = [
  "paid",
  "completed",
  "shipped",
  "collected",
];

/** The fulfilment steps staff can move an order through, in order. Payment
 *  itself is set by the PayFast ITN, never by hand. */
export const FULFILMENT_STEPS: OrderStatus[] = [
  "completed",
  "shipped",
  "collected",
];

export function isActive(status: OrderStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isDone(status: OrderStatus): boolean {
  return DONE_STATUSES.includes(status);
}

/** An order is only fulfillable once the money has landed. */
export function isPaid(status: OrderStatus): boolean {
  return status !== "received" && status !== "cancelled";
}

export function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "received":
      return "bg-amber-soft text-amber-deep";
    case "paid":
      return "bg-green-50 text-green-700";
    case "completed":
      return "bg-blue-50 text-blue-700";
    case "shipped":
    case "collected":
      return "bg-forest/10 text-forest";
    case "cancelled":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
}
