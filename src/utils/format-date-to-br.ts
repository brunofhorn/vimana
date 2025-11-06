import { parse, isValid, format } from "date-fns";

export function formatDateBR(d?: string | Date | null) {
  if (!d) return "—";

  const dt = toDateLocal(d);
  return isValid(dt) ? format(dt, "dd/MM/yyyy") : "—";
}

function toDateLocal(d?: string | Date | null): Date {
  if (!d) return new Date(NaN);

  if (d instanceof Date) return d;

  // se vier no formato "yyyy-MM-dd", parseia como data local
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return parse(d, "yyyy-MM-dd", new Date());
  }

  // se vier outro formato, tenta o parse normal
  const parsed = new Date(d);
  return isValid(parsed) ? parsed : new Date(NaN);
}