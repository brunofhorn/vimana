"use client"

import { Video } from "@/interfaces/videos"
import { VideosTable } from "./VideoTable"
import { useEffect, useState } from "react"
import { SocialNetworkData } from "@/interfaces/social-networks"

export default function Videos() {
    const [videos, setVideos] = useState<Video[]>([])
    const [socialNetworks, setSocialNetworks] = useState<SocialNetworkData[]>([])

    async function fetchVideos() {
        try {
            const response = await fetch("/api/video", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) throw new Error("Falha ao buscar redes sociais")
            const data = (await response.json()) as Video[]
            setVideos(data)
        } catch (error) {
            console.log(error)
        }
    }

    async function fetchSocialNetworks() {
        try {
            const response = await fetch("/api/social", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) throw new Error("Falha ao buscar redes sociais")
            const data = (await response.json()) as SocialNetworkData[]
            setSocialNetworks(data)
        } catch (error) {
            console.log(error)
        }
    }
    
    useEffect(() => {
        fetchVideos()
        fetchSocialNetworks()
    }, [])

    return (
        <VideosTable
            videos={videos}
            socialNetworks={socialNetworks}
            onDelete={async (video) => {
                const res = await fetch(`/api/video/${video.id}`, { method: "DELETE" })
                if (!res.ok) throw new Error("Falha ao excluir vídeo")
            }}
        />
    )
}