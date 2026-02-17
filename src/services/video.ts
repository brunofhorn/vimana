import {
  IVideo,
  VideoSocialPutPayload,
  VideoSocialPutResponse,
} from "@/interfaces/videos";
import { VideoFormCreateInput } from "@/schemas/video";
import { getHttpErrorMessage } from "@/services/http-error";

export async function getVideos() {
  const res = await fetch("/api/video", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res, "Falha ao buscar videos."));
  }

  const data = (await res.json()) as IVideo[];

  return data;
}

export async function getVideoById(videoId: string): Promise<IVideo> {
  const res = await fetch(`/api/video/${videoId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res, "Falha ao carregar video."));
  }

  return (await res.json()) as IVideo;
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
    throw new Error(await getHttpErrorMessage(res, "Falha ao criar video"));
  }

  const data: IVideo = await res.json();

  return data;
}

export async function updateVideo(
  videoId: string,
  payload: VideoFormCreateInput
): Promise<IVideo> {
  const res = await fetch(`/api/video/${videoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res, "Falha ao atualizar video."));
  }

  return (await res.json()) as IVideo;
}

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
    throw new Error(
      await getHttpErrorMessage(res, "Falha ao salvar redes do video")
    );
  }

  const data = (await res.json()) as VideoSocialPutResponse;
  return data;
}

export async function deleteVideo(videoId: string) {
  const res = await fetch(`/api/video/${videoId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res, "Falha ao remover o video"));
  }

  return res;
}
