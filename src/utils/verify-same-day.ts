import { isSameDay, parseISO } from "date-fns";

export function verifySameDay(a?: string | Date, b?: Date | null): boolean {
  if (!b) return true;
  if (!a) return false;

  const d1 = typeof a === "string" ? parseISO(a) : a;
  return isSameDay(d1, b);
}
