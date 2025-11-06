import { YesNoAll } from "@/interfaces/videos";

export function matchYesNo(
  filter: YesNoAll,
  value?: boolean | "S" | "N"
): boolean {
  if (filter === "") return true;
  if (value == null) return false;
  const bool = typeof value === "boolean" ? value : value === "S";
  return filter === "S" ? bool : !bool;
}
