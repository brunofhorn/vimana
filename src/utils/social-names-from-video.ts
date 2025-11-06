import { IVideo } from "@/interfaces/videos";

export function getSocialNamesFromVideo(v: IVideo): string[] {
  if (!v?.links) return [];

  const names = v.links
    .map((link) => link.social_network?.name?.trim())
    .filter((n): n is string => !!n && n.length > 0);

  return Array.from(new Set(names));
}
