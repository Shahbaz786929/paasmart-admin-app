import { OrderStatus } from "../api/orders";
import { colors } from "../theme/colors";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "Out for Delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function getStatusColor(status: OrderStatus): string {
  if (status === "CANCELLED") return colors.error;
  if (status === "DELIVERED" || status === "COMPLETED") return colors.primary;
  return colors.warning;
}

export function canCancelOrder(status: OrderStatus): boolean {
  return status === "PLACED" || status === "CONFIRMED";
}