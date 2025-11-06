import { parseISO, format } from "date-fns";

export function formatDateBR(d?: string | Date | null): string {
  if (!d) return "—";

  const dateObj = typeof d === "string" ? parseISO(d) : d;

  const corrected = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);

  return format(corrected, "dd/MM/yyyy");
}