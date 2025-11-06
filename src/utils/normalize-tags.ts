export function normalizeTags(tags: unknown): string[] {
  if (!tags) return [];

  if (Array.isArray(tags))
    return tags.filter((t): t is string => typeof t === "string");
  if (typeof tags === "string") {
    try {
      const arr = JSON.parse(tags);
      
      if (Array.isArray(arr))
        return arr.filter((t): t is string => typeof t === "string");
    } catch {
      return [];
    }

    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
}
