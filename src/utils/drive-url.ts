// utils/drive-url.ts
export function extractDriveId(url: string): string | null {
  try {
    const u = new URL(url)
    const m1 = u.pathname.match(/\/file\/d\/([^/]+)/)
    if (m1?.[1]) return m1[1]
    const idParam = u.searchParams.get("id")
    if (idParam) return idParam
  } catch {}
  const m = url.match(/\/file\/d\/([^/]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return m?.[1] ?? null
}

export function driveThumb(url: string, sz: string) {
  const id = extractDriveId(url)
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=${sz}` : url
}

export function driveView(url: string) {
  const id = extractDriveId(url)
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url
}

/** Retorna várias URLs candidatas (maior → menor) para usar com fallback */
export function drivePreviewCandidates(shareUrl: string): string[] {
  const sizes = ["w2000", "w1600", "w1200", "w800", "w600", "w400"]
  const thumbs = sizes.map((s) => driveThumb(shareUrl, s))
  return [...thumbs, driveView(shareUrl)]
}
