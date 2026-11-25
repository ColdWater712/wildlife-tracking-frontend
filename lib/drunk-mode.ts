export const DRUNK_STORAGE_KEY = "app-drunk-mode";
export const DRUNK_EVENT = "app-drunk-mode-change";
export const DRUNK_SOBER_EVENT = "app-drunk-sober-splash";

const TRANSACTION_PREFIXES = [
  "/pos",
  "/bookings",
  "/tourism/bookings",
  "/tourism/payments",
  "/tourism/check-in",
  "/tourism/prices",
] as const;

const TOUR_BOOKING_PATTERN = /^\/tours\/[^/]+\/book(\/|$)/;

/**
 * Returns true when the current route belongs to a transaction/cashier/payment
 * module where Drunk Mode must be automatically paused.
 */
export function isTransactionRoute(pathname: string): boolean {
  if (!pathname) return false;
  if (TOUR_BOOKING_PATTERN.test(pathname)) return true;
  return TRANSACTION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
