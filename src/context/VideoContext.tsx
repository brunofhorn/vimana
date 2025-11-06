"use client"

import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { IVideo, VideoFilters, VideoSocialPutPayload } from "@/interfaces/videos";
import { createVideo, getVideos, putVideoSocial } from "@/services/video";
import { normalizeText } from "@/utils/normalize-text";
import { searchableText } from "@/utils/searchable-text";
import { verifySameDay } from "@/utils/verify-same-day";
import { matchYesNo } from "@/utils/match-yes-or-no";
import { VideoFormCreateInput } from "@/schemas/video";

type VideoContextProps = {
    videos: IVideo[] | null
    fetchVideos: () => Promise<void>
    removeVideo: (id: string) => Promise<void>
    addNewVideo: (payload: VideoFormCreateInput) => Promise<IVideo>
    updateVideoSocial: (videoId: string, payload: VideoSocialPutPayload) => Promise<void>
    filters: VideoFilters;
    patchFilters: (partial: Partial<VideoFilters>) => void;
    clearFilters: () => void;
    filteredVideos: IVideo[];
    pageVideos: IVideo[];
    total: number;
}

const initialFilters: VideoFilters = {
    query: "",
    social: "",
    postedDate: null,
    publi: "",
    repost: "",
    order: "desc",
    page: 1,
    pageSize: 10,
};

export const VideoContext = createContext<VideoContextProps>(
    {} as VideoContextProps
)

export const VideoContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [videos, setVideos] = useState<IVideo[] | null>(null)
    const [filters, setFilters] = useState<VideoFilters>(initialFilters);

    const fetchVideos = useCallback(async () => {
        const videosResponse = await getVideos()

        setVideos(videosResponse)
    }, [])

    const removeVideo = async (id: string) => {
        console.log(id)
    }

    const patchFilters = useCallback((partial: Partial<VideoFilters>) => {
        setFilters(prev => ({ ...prev, ...partial }));
    }, []);

    const clearFilters = useCallback(() => setFilters(initialFilters), []);

    const filteredVideos = useMemo(() => {
        const listVideos = videos ?? [];
        const query = normalizeText(filters.query);

        const outVideos = listVideos.filter((video) => {
            if (query) {
                const textToCompare = searchableText(video);

                if (!textToCompare.includes(query)) {
                    return false;
                }
            }

            if (filters.social) {
                const hasLinkOnThatSocial = video.links?.some(
                    (l) => l.social_network?.id === filters.social
                );

                if (!hasLinkOnThatSocial) return false;
            }

            if (filters.postedDate && !video.links?.some(link => verifySameDay(link.posted_at, filters.postedDate))) {
                return false;
            }

            if (!matchYesNo(filters.publi, video.is_sponsored)) return false;

            if (!matchYesNo(filters.repost, video.is_repost)) return false;

            return true;
        });

        outVideos.sort((a, b) => {
            const da = new Date(a.created_at ?? 0).getTime();
            const db = new Date(b.created_at ?? 0).getTime();
            return filters.order === "asc" ? da - db : db - da;
        });

        return outVideos;
    }, [videos, filters]);


    const pageVideos = useMemo(() => {
        if (filters.pageSize === "ALL") return filteredVideos;

        const size = Number(filters.pageSize) || 10;
        const start = (filters.page - 1) * size;
        return filteredVideos.slice(start, start + size);
    }, [filteredVideos, filters.page, filters.pageSize]);

    const addNewVideo = useCallback(async (payload: VideoFormCreateInput) => {
        const created = await createVideo(payload)
        setVideos(prev => (prev ? [created, ...prev] : [created]))
        return created
    }, [])

    const updateVideoSocial = useCallback(async (videoId: string, payload: VideoSocialPutPayload) => {
        const resp = await putVideoSocial(videoId, payload);

        setVideos(prev => {
            if (!prev) return prev;

            return prev.map((v): IVideo => {
                if (v.id !== videoId) return v;

                return {
                    ...v,
                    links: resp.links.map((l): IVideo["links"][number] => ({
                        id: l.id,
                        video_id: videoId,
                        social_network_id: l.socialnetwork_id, // converte para o seu modelo
                        url: l.url,
                        posted_at: l.posted_at,                // string | Date
                        social_network: l.social_network,      // <- usa o objeto COMPLETO da API
                    })),
                };
            });
        });
    }, []);

    return (
        <VideoContext.Provider value={{
            videos,
            filters,
            addNewVideo,
            fetchVideos,
            removeVideo,
            updateVideoSocial,
            patchFilters,
            clearFilters,
            filteredVideos,
            pageVideos,
            total: filteredVideos.length,
        }}>
            {children}
        </VideoContext.Provider>
    )
}

export const useVideoContext = () => {
    const context = useContext(VideoContext)

    return context
}