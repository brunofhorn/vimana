export function formatDateBR(d?: string | Date | null) {
  const dt = toDate(d);
  return dt ? dt.toLocaleDateString("pt-BR") : "—";
}

function toDate(d?: string | Date | null) {
  if (!d) return null;
  if (d instanceof Date) return d;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}
