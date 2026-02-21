"use client" 

import { useSocialNetworkContext } from "@/context/SocialNetworkContext"
import { useVideoContext } from "@/context/VideoContext"
import { useLoadingsContext } from "@/context/LoadingsContext"
import VideoTable from "./VideoTable"
import VideoTableFilter from "./VideoTableFilter"
import VideoTableOrder from "./VideoTableOrder"
import VideoTablePageSize from "./VideoTablePageSize"
import VideoTablePagination from "./VideoTablePagination"
import { useCallback, useEffect } from "react"
import { toast } from "sonner"

export default function Videos() {
    const { ensureSocialNetworks } = useSocialNetworkContext()
    const { ensureVideos } = useVideoContext()
    const { handleLoadings } = useLoadingsContext()

    const handleInitialData = useCallback(async () => {
        try {
            handleLoadings({ key: "video", value: true })
            await Promise.all([ensureSocialNetworks(), ensureVideos()])
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Falha ao carregar os dados da tela de videos.";
            toast.error("Erro!", { description: message })
        } finally {
            handleLoadings({ key: "video", value: false })
        }
    }, [ensureSocialNetworks, ensureVideos, handleLoadings])

    useEffect(() => {
        void handleInitialData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <VideoTableFilter />
            <div className="flex flex-row justify-between">
                <VideoTableOrder />
                <VideoTablePageSize />
            </div>
            <VideoTable />
            <VideoTablePagination />
        </>
    )
}
