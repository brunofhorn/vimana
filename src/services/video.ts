import {
  IVideo,
  VideoListQuery,
  VideoListResponse,
  VideoSocialPutPayload,
  VideoSocialPutResponse,
} from "@/interfaces/videos";
import { VideoFormCreateInput } from "@/schemas/video";
import { getHttpErrorMessage } from "@/services/http-error";
import { getApiJsonHeaders } from "@/services/http-headers";

export async function getVideos(
  query: VideoListQuery = {}
): Promise<VideoListResponse> {
  const params = new URLSearchParams();

  if (query.query) params.set("query", query.query);
  if (query.social) params.set("social", query.social);
  if (query.socialMode) params.set("socialMode", query.socialMode);
  if (query.postedDate) params.set("postedDate", query.postedDate);
  if (query.publi) params.set("publi", query.publi);
  if (query.repost) params.set("repost", query.repost);
  if (query.order) params.set("order", query.order);
  if (typeof query.page === "number") params.set("page", String(query.page));
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize));

  const qs = params.toString();
  const url = qs ? `/api/video?${qs}` : "/api/video";

  const res = await fetch(url, {
    method: "GET",
    headers: getApiJsonHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res, "Falha ao buscar videos."));
  }

  const data = (await res.json()) as VideoListResponse;

  return data;
}

export async function getVideoById(videoId: string): Promise<IVideo> {
  const res = await fetch(`/api/video/${videoId}`, {
    method: "GET",
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
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
    headers: getApiJsonHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res, "Falha ao remover o video"));
  }

  return res;
}
