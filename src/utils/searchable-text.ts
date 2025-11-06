import { IVideo, IVideoLinks } from "@/interfaces/videos";
import { normalizeText } from "./normalize-text";

export function searchableText(v: IVideo): string {
  const parts: string[] = [];

  if (v?.title) {
    parts.push(v.title);
  }

  if (v?.description) {
    parts.push(v.description);
  }

  if (Array.isArray(v?.tags)) {
    parts.push(String(v.tags.join(" ")));
  }

  if (v?.raw_video_url) {
    parts.push(v.raw_video_url);
  }

  if (Array.isArray(v?.links)) {
    parts.push(
      v.links
        .map(
          (link: IVideoLinks) =>
            `${link.social_network?.name ?? ""} ${link?.url ?? ""}`
        )
        .join(" ")
    );
  }
  
  return normalizeText(parts.join(" "));
}
