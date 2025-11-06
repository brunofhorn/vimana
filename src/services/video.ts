import {
  IVideo,
  VideoSocialLinkDTO,
  VideoSocialPutPayload,
  VideoSocialPutResponse,
} from "@/interfaces/videos";
import { VideoFormCreateInput } from "@/schemas/video";

export async function getVideos() {
  const res = await fetch("/api/video", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Falha ao buscar vídeos.");
  }

  const data = (await res.json()) as IVideo[];

  return data;
}

export async function createVideo(
  payload: VideoFormCreateInput
): Promise<IVideo> {
  const res = await fetch("/api/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Falha ao criar vídeo");
  }

  const data: IVideo = await res.json();

  return data;
}

type ILinks = {
  id: string;
  url: string;
  name: string;
  icon: string;
  created_at: Date;
  updated_at: Date;
  socialnetwork_id: string;
  posted_at: Date;
  video_id: string;
};

export async function putVideoSocial(
  videoId: string,
  payload: VideoSocialPutPayload
): Promise<VideoSocialPutResponse> {
  const res = await fetch(`/api/video/${videoId}/social`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Falha ao salvar redes do vídeo";
    try {
      const err = (await res.json()) as { message?: string };
      if (typeof err?.message === "string") message = err.message;
    } catch {}
    throw new Error(message);
  }

  const data = (await res.json()) as VideoSocialPutResponse;
  return data;
}

// export async function postSocialNetwork(
//   social: SocialNetworksFormCreateValues
// ) {
//   const res = await fetch("/api/social", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(social),
//   });

//   if (!res.ok) {
//     throw new Error("Falha ao criar a rede social.");
//   }

//   const created = (await res.json()) as ISocialNetwork;

//   return created;
// }

// export async function putSocialNetwork(social: ISocialNetwork) {
//   const res = await fetch(`/api/social/${social.id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(social),
//   });

//   if (!res.ok) {
//     throw new Error("Falha ao criar a rede social.");
//   }

//   const updated = (await res.json()) as ISocialNetwork;

//   return updated;
// }

// export async function deleteSocialNetwork(id: string) {
//   const res = await fetch(`/api/social/${id}`, {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json" },
//   });

//   return res;
// }
