"use client" 

import { useSocialNetworkContext } from "@/context/SocialNetworkContext"
import VideoTable from "./VideoTable"
import VideoTableFilter from "./VideoTableFilter"
import VideoTableOrder from "./VideoTableOrder"
import VideoTablePageSize from "./VideoTablePageSize"
import VideoTablePagination from "./VideoTablePagination"
import { useCallback, useEffect } from "react"

export default function Videos() {
    const { fetchSocialNetworks } = useSocialNetworkContext()

    const handleFetchSocialNetworks = useCallback(async () => {
        await fetchSocialNetworks()
    }, [fetchSocialNetworks])

    useEffect(() => {
        (async () => {
            await Promise.all([
                handleFetchSocialNetworks()
            ])
        })()
    }, [handleFetchSocialNetworks])

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