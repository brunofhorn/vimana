"use client"

import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from "react";
import { IVideo, VideoFilters, VideoSocialPutPayload } from "@/interfaces/videos";
import { createVideo, deleteVideo, getVideos, putVideoSocial } from "@/services/video";
import { VideoFormCreateInput } from "@/schemas/video";
import { useEffect } from "react";

type VideoContextProps = {
    videos: IVideo[] | null
    fetchVideos: () => Promise<void>
    ensureVideos: (force?: boolean) => Promise<void>
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
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<VideoFilters>(initialFilters);
    const backupRef = useRef<IVideo[] | null>(null);
    const inFlightFetchRef = useRef<Promise<void> | null>(null);
    const requestSeqRef = useRef(0);


    const fetchVideos = useCallback(async () => {
        const reqId = ++requestSeqRef.current;
        const postedDate = filters.postedDate
            ? new Date(
                Date.UTC(
                    filters.postedDate.getFullYear(),
                    filters.postedDate.getMonth(),
                    filters.postedDate.getDate()
                )
            ).toISOString().slice(0, 10)
            : undefined;

        const response = await getVideos({
            query: filters.query,
            social: filters.social,
            postedDate,
            publi: filters.publi,
            repost: filters.repost,
            order: filters.order,
            page: filters.page,
            pageSize: filters.pageSize,
        })

        // Evita aplicar resposta antiga quando filtros mudam rapidamente.
        if (reqId !== requestSeqRef.current) return;

        setVideos(response.items)
        setTotal(response.total)
    }, [filters])

    const ensureVideos = useCallback(async (force = false) => {
        if (!force && videos !== null) return;

        if (inFlightFetchRef.current) {
            await inFlightFetchRef.current;
            return;
        }

        inFlightFetchRef.current = (async () => {
            try {
                await fetchVideos();
            } finally {
                inFlightFetchRef.current = null;
            }
        })();

        await inFlightFetchRef.current;
    }, [fetchVideos, videos]);

    const removeVideo = useCallback(async (id: string) => {
        setVideos(prev => {
            backupRef.current = prev ?? [];
            return (prev ?? []).filter(l => l.id !== id);
        });
        setTotal(prev => Math.max(0, prev - 1));

        try {
            await deleteVideo(id)
        } catch (e) {
            setVideos(backupRef.current ?? []);
            setTotal(prev => prev + 1);
            throw e;
        }
    }, []);

    const patchFilters = useCallback((partial: Partial<VideoFilters>) => {
        setFilters(prev => ({ ...prev, ...partial }));
    }, []);

    const clearFilters = useCallback(() => setFilters(initialFilters), []);

    const filteredVideos = useMemo(() => videos ?? [], [videos]);
    const pageVideos = useMemo(() => videos ?? [], [videos]);

    const addNewVideo = useCallback(async (payload: VideoFormCreateInput) => {
        const created = await createVideo(payload)
        setVideos(prev => (prev ? [created, ...prev] : [created]))
        setTotal(prev => prev + 1)
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
                        social_network_id: l.social_network_id,
                        url: l.url,
                        posted_at: l.posted_at,
                        social_network: l.social_network,
                    })),
                };
            });
        });
    }, []);

    useEffect(() => {
        // Refetch server-side filtering only after the first load was completed.
        if (videos === null) return;
        void fetchVideos();
    }, [filters, fetchVideos]);

    return (
        <VideoContext.Provider value={{
            videos,
            filters,
            addNewVideo,
            fetchVideos,
            ensureVideos,
            removeVideo,
            updateVideoSocial,
            patchFilters,
            clearFilters,
            filteredVideos,
            pageVideos,
            total,
        }}>
            {children}
        </VideoContext.Provider>
    )
}

export const useVideoContext = () => {
    const context = useContext(VideoContext)

    return context
}
