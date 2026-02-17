export async function getHttpErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const payload = (await res.json()) as { message?: string };
    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  } catch {}

  return fallback;
}
